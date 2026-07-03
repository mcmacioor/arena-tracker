import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9327;
const profileDir = join(root, "work", `edge-profile-${Date.now()}`);
const appUrl = "http://127.0.0.1:4173/";
const storageKey = "arenatracker.matches.v1";
const errors = [];
const smokeMatches = [
  {
    id: "smoke-1",
    date: "2026-06-30",
    patch: "16.13",
    champion: "Vi",
    teammates: [
      { champion: "Galio", riotId: "GalioMain#EUNE" },
      { champion: "Lulu", riotId: "ShieldBot#EUNE" },
    ],
    placement: 1,
    augments: [1324],
    items: ["Black Cleaver"],
  },
  {
    id: "smoke-2",
    date: "2026-06-29",
    patch: "16.13",
    champion: "LeeSin",
    teammates: [
      { champion: "Yuumi", riotId: "ShieldBot#EUNE" },
      { champion: "Malphite", riotId: "RockSolid#EUNE" },
    ],
    placement: 1,
    augments: ["Blade Waltz"],
    items: ["Serylda's Grudge"],
  },
  {
    id: "smoke-3",
    date: "2026-06-28",
    patch: "16.13",
    champion: "Vi",
    teammates: [
      { champion: "Braum", riotId: "BraumEnjoyer#EUNE" },
      { champion: "Lulu", riotId: "ShieldBot#EUNE" },
    ],
    placement: 3,
    augments: ["Goliath"],
    items: ["Sterak's Gage"],
  },
  {
    id: "smoke-4",
    date: "2026-06-27",
    patch: "16.13",
    champion: "Jhin",
    teammates: [
      { champion: "Maokai", riotId: "TreePlayer#EUNE" },
      { champion: "Nami", riotId: "WaveMain#EUNE" },
    ],
    placement: 5,
    augments: ["Scoped Weapons"],
    items: ["Infinity Edge"],
  },
];

await mkdir(profileDir, { recursive: true });

const browserProcess = spawn(
  edgePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);

try {
  const page = await waitForPage();
  const cdp = await connectCdp(page.webSocketDebuggerUrl);

  cdp.on("Runtime.exceptionThrown", (event) => {
    errors.push(event.exceptionDetails?.text || "Runtime exception");
  });

  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  const loadPromise = cdp.waitFor("Page.loadEventFired");
  await cdp.send("Page.navigate", { url: appUrl });
  await loadPromise;
  await evalPage(
    cdp,
    `localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(JSON.stringify(smokeMatches))})`,
  );
  const reloadPromise = cdp.waitFor("Page.loadEventFired");
  await cdp.send("Page.reload");
  await reloadPromise;
  await evalPage(cdp, `new Promise((resolve) => setTimeout(resolve, 150))`, true);

  const seededCount = await evalPage(
    cdp,
    `JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})).length`,
  );
  assert(seededCount === 4, `Expected 4 smoke matches, got ${seededCount}`);

  const guestHome = await evalPage(
    cdp,
    `document.body.classList.contains("is-guest-home") && getComputedStyle(document.querySelector("#landingSearch")).display !== "none"`,
  );
  assert(guestHome, "Logged-out dashboard should show the player search landing");
  const dashboardNavMissing = await evalPage(
    cdp,
    `document.querySelector('.sidebar .nav-link') == null`,
  );
  assert(dashboardNavMissing, "Sidebar should not contain duplicate tab navigation");
  const sidebarRemoved = await evalPage(
    cdp,
    `document.querySelector(".sidebar") == null`,
  );
  assert(sidebarRemoved, "Legacy sidebar should be removed");
  const topbarBrandVisible = await evalPage(
    cdp,
    `getComputedStyle(document.querySelector("#brandHomeButton")).display !== "none"`,
  );
  assert(topbarBrandVisible, "Top bar brand should be visible");
  const languageFlagVisible = await evalPage(
    cdp,
    `getComputedStyle(document.querySelector("#languageFlag")).display !== "none" && document.querySelector('#languageSelect option[value="pl"]').textContent.trim() === "PL"`,
  );
  assert(languageFlagVisible, "Language switch should use a CSS flag and plain language code");
  const searchClickNavigates = await evalPage(
    cdp,
    `(() => {
      const form = document.querySelector(".top-player-search");
      if (typeof activateSearchResult !== "function" || !form) return false;
      activateSearchResult(form, { gameName: "Tester", tagLine: "EUW", region: "euw1" });
      return location.pathname === "/euw/Tester-EUW";
    })()`,
  );
  assert(searchClickNavigates, "Clicking a search suggestion should open that profile");
  await evalPage(cdp, `history.pushState(null, "", "/#dashboard"); updateRoute()`);

  await evalPage(cdp, `location.hash = "champions"`);
  await evalPage(cdp, `new Promise((resolve) => setTimeout(resolve, 100))`, true);
  const profileTabsVisible = await evalPage(
    cdp,
    `document.querySelector('.profile-tabs [data-route="dashboard"]') != null`,
  );
  assert(profileTabsVisible, "Profile tabs should include the summary route");
  const collectionText = await evalPage(cdp, `document.querySelector("#championCollection").innerText`);
  assert(collectionText.includes("Vi"), "Won champion Vi missing from collection");
  assert(collectionText.includes("Lee Sin"), "Canonical Lee Sin missing from collection");
  assert(!collectionText.includes("LeeSin"), "Raw Riot champion key should not be rendered");
  const collectionCardCount = await evalPage(
    cdp,
    `document.querySelectorAll("#championCollection .champion-collection-card").length`,
  );
  const collectionHasChampionArt = await evalPage(
    cdp,
    `getComputedStyle(document.querySelector("#championCollection .champion-collection-card")).getPropertyValue("--champion-art").includes("ddragon")`,
  );
  const championCount = await evalPage(cdp, `window.ARENA_GAME_DATA.champions.length`);
  assert(collectionCardCount === championCount, `Expected all champion cards by default, got ${collectionCardCount}`);
  assert(collectionHasChampionArt, "Champion cards should render champion art backgrounds");
  await evalPage(cdp, `document.querySelector('[data-collection-mode="won"]').click()`);
  const wonCardCount = await evalPage(
    cdp,
    `document.querySelectorAll("#championCollection .champion-collection-card").length`,
  );
  assert(wonCardCount === 2, `Expected 2 won champion cards, got ${wonCardCount}`);
  await evalPage(cdp, `document.querySelector('[data-collection-mode="all"]').click()`);

  await evalPage(cdp, `document.querySelector("#championSearchInput").value = "Vi"`);
  await evalPage(cdp, `document.querySelector("#championSearchInput").dispatchEvent(new Event("input"))`);
  const filteredCollectionText = await evalPage(cdp, `document.querySelector("#championCollection").innerText`);
  assert(filteredCollectionText.includes("Vi"), "Filtered collection should contain Vi");
  assert(!filteredCollectionText.includes("Lee Sin"), "Filtered collection should hide Lee Sin");
  await evalPage(cdp, `document.querySelector('[data-collection-mode="missing"]').click()`);
  await evalPage(cdp, `document.querySelector("#championSearchInput").value = "Aatrox"`);
  await evalPage(cdp, `document.querySelector("#championSearchInput").dispatchEvent(new Event("input"))`);
  const missingText = await evalPage(cdp, `document.querySelector("#championCollection").innerText`);
  assert(missingText.includes("Aatrox"), "Missing filter should include unwon champions");

  await evalPage(cdp, `document.querySelector("#championSearchInput").value = "Vi"`);
  await evalPage(cdp, `document.querySelector("#championSearchInput").dispatchEvent(new Event("input"))`);
  await evalPage(cdp, `document.querySelector('[data-collection-mode="all"]').click()`);
  await evalPage(cdp, `document.querySelector('[data-champion-detail="Vi"]').click()`);
  const detailOpen = await evalPage(
    cdp,
    `document.querySelector("#championDetailOverlay").classList.contains("is-open")`,
  );
  assert(detailOpen, "Champion detail modal should open after clicking a champion");
  const detailText = await evalPage(cdp, `document.querySelector("#championDetailOverlay").innerText`);
  assert(
    detailText.includes("Średnie miejsce") || detailText.includes("Average place"),
    "Champion detail should include average placement",
  );
  const metasrcBuildLink = await evalPage(
    cdp,
    `(() => {
      const link = document.querySelector("#championDetailBuild .metasrc-build-link");
      return link != null && link.href.includes("metasrc.com/lol/arena/build/vi");
    })()`,
  );
  assert(metasrcBuildLink, "Champion detail should show a MetaSRC build link");
  await evalPage(cdp, `document.querySelector("#championDetailClose").click()`);

  await evalPage(cdp, `location.hash = "matches"`);
  await evalPage(cdp, `new Promise((resolve) => setTimeout(resolve, 100))`, true);
  const matchText = await evalPage(cdp, `document.querySelector("#matchList").innerText`);
  assert(
    matchText.includes("Shake Proteinowy") || matchText.includes("Protein Shake"),
    "Numeric augment id should resolve to a localized name",
  );
  assert(!matchText.includes("1324"), "Numeric augment id should not be rendered raw");
  assert(
    (matchText.toLowerCase().includes("augmenty") || matchText.toLowerCase().includes("augments"))
      && (matchText.toLowerCase().includes("itemy") || matchText.toLowerCase().includes("items")),
    "Match cards should split augments and items",
  );
  const matchChampionIconCount = await evalPage(
    cdp,
    `document.querySelectorAll("#matchList .match-champion-icons .champion-icon").length`,
  );
  assert(matchChampionIconCount > 0, "Match history should show champion icons");
  const showMoreHidden = await evalPage(
    cdp,
    `document.querySelector("#showMoreMatchesButton").classList.contains("is-hidden")`,
  );
  assert(showMoreHidden, "Show more should stay hidden when all matches fit on the first page");
  await evalPage(cdp, `document.querySelector("[data-match-detail]").click()`);
  await evalPage(cdp, `new Promise((resolve) => setTimeout(resolve, 100))`, true);
  const matchDetailOpen = await evalPage(
    cdp,
    `document.querySelector('[data-view="match-detail"]').classList.contains("is-visible")`,
  );
  assert(matchDetailOpen, "Match detail page should open after clicking a match");
  const legacyModalClosed = await evalPage(
    cdp,
    `!document.querySelector("#matchDetailOverlay").classList.contains("is-open")`,
  );
  assert(legacyModalClosed, "Legacy match modal should stay closed");
  const matchDetailText = await evalPage(cdp, `document.querySelector("#matchDetailView").innerText`);
  assert(
    matchDetailText.includes("Shake Proteinowy") || matchDetailText.includes("Protein Shake"),
    "Match detail should include resolved augment names",
  );
  assert(matchDetailText.includes("Gracze") || matchDetailText.includes("Players"), "Match detail should show players");
  const matchDetailTitle = await evalPage(cdp, `document.querySelector("#matchDetailPageTitle").textContent`);
  assert(!matchDetailTitle.includes("+"), "Match detail title should not duplicate the team title");
  const playerCards = await evalPage(
    cdp,
    `document.querySelectorAll("#matchDetailPagePlayers .player-detail-card").length`,
  );
  assert(playerCards >= 3, "Match detail should include the team fallback players");
  const teamGroups = await evalPage(
    cdp,
    `document.querySelectorAll("#matchDetailPagePlayers .match-team-group").length`,
  );
  assert(teamGroups >= 1, "Match detail should group players by team");

  const assetDescriptions = await evalPage(
    cdp,
    `(() => {
      const goliath = normalizeAssetTag({ id: "41", name: "Goliath" });
      const boots = normalizeAssetTag({ id: "223158", name: "Ionian Boots of Lucidity" });
      return {
        goliath: assetDescription(goliath),
        boots: assetDescription(boots),
      };
    })()`,
  );
  assert(!assetDescriptions.goliath.includes("@"), "Augment descriptions should not expose raw placeholders");
  assert(!assetDescriptions.goliath.includes("%i:"), "Augment descriptions should not expose icon placeholders");
  assert(!assetDescriptions.goliath.includes("{{"), "Augment descriptions should not expose template placeholders");
  assert(assetDescriptions.goliath.includes("15 - 75"), "Goliath description should resolve variable ranges");
  assert(assetDescriptions.boots.includes("\n45"), "Item descriptions should keep line breaks between stats");
  const rawDescriptionLeaks = await evalPage(
    cdp,
    `(() => {
      const details = [
        ...Object.values(window.ARENA_GAME_DATA.itemDetails || {}),
        ...Object.values(window.ARENA_GAME_DATA.augmentDetails || {}),
      ];
      return details
        .filter((detail) => Object.values(detail.descriptions || {}).some((text) => /@[A-Za-z]|%i:|{{/.test(text)))
        .slice(0, 5)
        .map((detail) => detail.id);
    })()`,
  );
  assert(rawDescriptionLeaks.length === 0, `Game data descriptions should not expose template placeholders: ${rawDescriptionLeaks.join(", ")}`);

  await evalPage(
    cdp,
    `(() => {
      history.pushState(null, "", "/euw/Smoke-Tester#dashboard");
      state.publicRoute = { region: "euw", slug: "Smoke-Tester" };
      state.publicProfile = {
        routeKey: "euw/Smoke-Tester",
        loading: false,
        refreshing: false,
        error: "",
        data: {
          profile: {
            gameName: "Smoke",
            tagLine: "Tester",
            region: "euw1",
            profileIconUrl: window.ARENA_GAME_DATA.championIcons.Malphite,
            lastSyncedAt: new Date().toISOString(),
          },
          progress: { won: 2, total: window.ARENA_GAME_DATA.champions.length },
          wonChampions: [],
          matches: state.matches,
          topDuo: [],
        },
      };
      state.activeMatchId = "";
      setActiveRoute("dashboard");
      render();
    })()`,
  );
  const publicChromeVisible = await evalPage(
    cdp,
    `getComputedStyle(document.querySelector(".profile-hero")).display !== "none"
      && getComputedStyle(document.querySelector(".profile-tabs")).display !== "none"
      && document.querySelector("[data-route='friends']") == null`,
  );
  assert(publicChromeVisible, "Public profiles should show the shared profile hero and tabs without the private group tab");
  await evalPage(cdp, `openMatchDetail("smoke-1")`);
  await evalPage(cdp, `new Promise((resolve) => setTimeout(resolve, 100))`, true);
  const publicMatchDetailFound = await evalPage(
    cdp,
    `document.querySelector('[data-view="match-detail"]').classList.contains("is-visible")
      && !document.querySelector("#matchDetailView").innerText.includes("Nie znaleziono meczu.")
      && !document.querySelector("#matchDetailView").innerText.includes("Match not found.")
      && document.querySelector("#matchDetailPageTitle").textContent !== "Mecz"`,
  );
  assert(publicMatchDetailFound, "Public profile match detail should render the selected match");

  const accountMenuRemoved = await evalPage(cdp, `document.querySelector("#accountMenuButton") == null`);
  assert(accountMenuRemoved, "Login/account menu should be removed from the visible app chrome");

  const brandReturnsHome = await evalPage(
    cdp,
    `(() => {
      history.pushState(null, "", "/euw/Smoke-Tester#dashboard");
      updateRoute();
      document.querySelector("#brandHomeButton").click();
      return location.pathname === "/" && document.body.classList.contains("is-guest-home");
    })()`,
  );
  assert(brandReturnsHome, "ArenaTracker brand should return to the landing search");

  await evalPage(
    cdp,
    `(() => {
      history.pushState(null, "", "/leaderboard");
      updateRoute();
      state.leaderboard = {
        loading: false,
        error: "",
        updatedAt: new Date().toISOString(),
        region: "euw1",
        rows: [{
          rank: 1,
          gameName: "Smoke",
          tagLine: "Tester",
          region: "euw1",
          publicPath: "/euw/Smoke-Tester",
          profileIconUrl: window.ARENA_GAME_DATA.championIcons.Malphite,
          score: 244,
          championWins: 2,
          wins: 2,
          top4: 3,
          matches: 4,
        }],
      };
      renderLeaderboard();
    })()`,
  );
  const leaderboardVisible = await evalPage(
    cdp,
    `document.querySelector('[data-view="leaderboard"]').classList.contains("is-visible")
      && document.querySelector("#leaderboardRows").innerText.includes("Smoke#Tester")`,
  );
  assert(leaderboardVisible, "Leaderboard view should render cached public profiles");
  const leaderboardClickNavigates = await evalPage(
    cdp,
    `(() => {
      document.querySelector("#leaderboardRows [data-public-path]").click();
      return location.pathname === "/euw/Smoke-Tester";
    })()`,
  );
  assert(leaderboardClickNavigates, "Leaderboard rows should open public profiles");

  if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
  console.log("Smoke test passed: public profiles, details, champions and leaderboard.");
} finally {
  browserProcess.kill();
}

async function waitForPage() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const pages = await response.json();
      const page = pages.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      await delay(100);
    }
  }
  throw new Error("Timed out waiting for headless Edge.");
}

function connectCdp(url) {
  const socket = new WebSocket(url);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  socket.addEventListener("message", (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) reject(new Error(payload.error.message));
      else resolve(payload.result);
      return;
    }

    const callbacks = listeners.get(payload.method) || [];
    callbacks.forEach((callback) => callback(payload.params || {}));
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      resolve({
        on(method, callback) {
          listeners.set(method, [...(listeners.get(method) || []), callback]);
        },
        send(method, params = {}) {
          const id = nextId;
          nextId += 1;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((methodResolve, methodReject) => {
            pending.set(id, { resolve: methodResolve, reject: methodReject });
          });
        },
        waitFor(method) {
          return new Promise((waitResolve) => {
            const once = (params) => {
              waitResolve(params);
              listeners.set(
                method,
                (listeners.get(method) || []).filter((callback) => callback !== once),
              );
            };
            listeners.set(method, [...(listeners.get(method) || []), once]);
          });
        },
      });
    });
    socket.addEventListener("error", () => reject(new Error("Failed to connect to CDP.")));
  });
}

async function evalPage(cdp, expression, awaitPromise = false) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }
  return result.result?.value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
