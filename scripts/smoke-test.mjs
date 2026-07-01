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
  const searchClickDoesNotNavigate = await evalPage(
    cdp,
    `(() => {
      const before = location.pathname;
      const form = document.querySelector(".top-player-search");
      if (typeof selectSearchResult !== "function" || !form) return false;
      selectSearchResult(form, { gameName: "Tester", tagLine: "EUW", region: "euw1" });
      return location.pathname === before && form.querySelector('input[name="riotId"]').value === "Tester#EUW";
    })()`,
  );
  assert(searchClickDoesNotNavigate, "Clicking a search suggestion should only fill the search field");

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
  assert(!collectionText.includes("Brakuje wygranej"), "Default collection should only list won champions");
  const collectionIconCount = await evalPage(
    cdp,
    `document.querySelectorAll("#championCollection .champion-icon").length`,
  );
  assert(collectionIconCount === 2, `Expected 2 won champion icons, got ${collectionIconCount}`);

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
  assert(detailText.includes("Średnie miejsce"), "Champion detail should include average placement");
  await evalPage(cdp, `document.querySelector("#championDetailClose").click()`);

  await evalPage(cdp, `location.hash = "matches"`);
  await evalPage(cdp, `new Promise((resolve) => setTimeout(resolve, 100))`, true);
  const matchText = await evalPage(cdp, `document.querySelector("#matchList").innerText`);
  assert(matchText.includes("Protein Shake"), "Numeric augment id should resolve to a name");
  assert(!matchText.includes("1324"), "Numeric augment id should not be rendered raw");
  assert(matchText.toLowerCase().includes("augmenty") && matchText.toLowerCase().includes("itemy"), "Match cards should split augments and items");
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
  assert(matchDetailText.includes("Protein Shake"), "Match detail should include resolved augment names");
  assert(matchDetailText.includes("Gracze"), "Match detail should show players");
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

  await evalPage(cdp, `location.hash = "friends"`);
  await evalPage(cdp, `new Promise((resolve) => setTimeout(resolve, 100))`, true);
  const friendsText = await evalPage(cdp, `document.querySelector("#friendRanking").innerText`);
  assert(friendsText.includes("Zaloguj"), "Friend ranking should require login");

  await evalPage(cdp, `document.querySelector("#accountMenuButton").click()`);
  const accountOverlayOpen = await evalPage(
    cdp,
    `document.querySelector("#accountOverlay").classList.contains("is-open")`,
  );
  assert(accountOverlayOpen, "Account button should open the account modal");
  const profileHidden = await evalPage(
    cdp,
    `document.querySelector("#profilePanel").classList.contains("is-hidden")`,
  );
  assert(profileHidden, "Riot profile panel should stay hidden while logged out");
  const authAvatar = await evalPage(cdp, `document.querySelector("#accountDialogAvatar").src`);
  assert(authAvatar.includes("Malphite.png"), "Logged-out auth avatar should use Malphite");
  await evalPage(cdp, `document.querySelector("#loginEmail").value = "wrong@example.com"`);
  await evalPage(cdp, `document.querySelector("#loginPassword").value = "badpass123"`);
  await evalPage(cdp, `document.querySelector("#loginForm").requestSubmit()`);
  await evalPage(cdp, `new Promise((resolve) => setTimeout(resolve, 250))`, true);
  const loginErrorVisible = await evalPage(
    cdp,
    `document.querySelector("#accountStatus").classList.contains("is-error") && !document.querySelector("#accountStatus").classList.contains("is-hidden")`,
  );
  assert(loginErrorVisible, "Login errors should be shown inside the account modal");
  await evalPage(cdp, `document.querySelector('[data-auth-switch="reset"]').click()`);
  const resetVisible = await evalPage(
    cdp,
    `document.querySelector('#resetPasswordForm').classList.contains('is-visible')`,
  );
  assert(resetVisible, "Reset password tab did not become visible");

  if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
  console.log("Smoke test passed: data aliases, filters, details and account modal.");
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
