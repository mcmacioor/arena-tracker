const APP_VERSION = "0.5.0";
const GAME_DATA = globalThis.ARENA_GAME_DATA || {};
const DATA_DRAGON_VERSION = GAME_DATA.version || "16.13.1";
const STORAGE_KEY = "arenatracker.matches.v1";
const LANGUAGE_STORAGE_KEY = "arenatracker.language.v1";
const FRIENDS_STORAGE_KEY = "arenatracker.friends.v1";
const CHAMPION_ICONS = GAME_DATA.championIcons || {};
const CHAMPION_KEYS = GAME_DATA.championKeys || {};
const CHAMPION_ALIASES = GAME_DATA.championAliases || {};
const DEFAULT_AUTH_AVATAR = CHAMPION_ICONS.Malphite || "";
const ARENA_MAX_PLACEMENT = 6;
const RIOT_SYNC_LIMIT = 80;
const RIOT_SEASON_SYNC_LIMIT = 300;

const translations = {
  pl: {
    "actions.sync": "Synchronizuj",
    "actions.exportPng": "Eksport PNG",
    "actions.coffee": "Postaw kawę",
    "settings.language": "Język",
    "nav.history": "Historia",
    "nav.wins": "Championi",
    "tabs.summary": "Podsumowanie",
    "tabs.history": "Historia",
    "tabs.wins": "Championi",
    "tabs.group": "Moja grupa",
    "progress.label": "Postęp",
    "progress.title": "Wygrani championi",
    "history.title": "Historia",
    "friends.title": "Moja grupa",
    "matchDetails.title": "Szczegóły meczu",
    "actions.showMore": "Pokaż więcej",
  },
  en: {
    "actions.sync": "Sync",
    "actions.exportPng": "Export PNG",
    "actions.coffee": "Buy coffee",
    "settings.language": "Language",
    "nav.history": "History",
    "nav.wins": "Champions",
    "tabs.summary": "Summary",
    "tabs.history": "History",
    "tabs.wins": "Champions",
    "tabs.group": "My group",
    "progress.label": "Progress",
    "progress.title": "Champion wins",
    "history.title": "History",
    "friends.title": "My group",
    "matchDetails.title": "Match details",
    "actions.showMore": "Show more",
  },
};

const CHAMPIONS = GAME_DATA.champions || [
  "Aatrox",
  "Ahri",
  "Akali",
  "Akshan",
  "Alistar",
  "Ambessa",
  "Amumu",
  "Anivia",
  "Annie",
  "Aphelios",
  "Ashe",
  "Aurelion Sol",
  "Aurora",
  "Azir",
  "Bard",
  "Bel'Veth",
  "Blitzcrank",
  "Brand",
  "Braum",
  "Briar",
  "Caitlyn",
  "Camille",
  "Cassiopeia",
  "Cho'Gath",
  "Corki",
  "Darius",
  "Diana",
  "Draven",
  "Dr. Mundo",
  "Ekko",
  "Elise",
  "Evelynn",
  "Ezreal",
  "Fiddlesticks",
  "Fiora",
  "Fizz",
  "Galio",
  "Gangplank",
  "Garen",
  "Gnar",
  "Gragas",
  "Graves",
  "Gwen",
  "Hecarim",
  "Heimerdinger",
  "Hwei",
  "Illaoi",
  "Irelia",
  "Ivern",
  "Janna",
  "Jarvan IV",
  "Jax",
  "Jayce",
  "Jhin",
  "Jinx",
  "Kai'Sa",
  "Kalista",
  "Karma",
  "Karthus",
  "Kassadin",
  "Katarina",
  "Kayle",
  "Kayn",
  "Kennen",
  "Kha'Zix",
  "Kindred",
  "Kled",
  "Kog'Maw",
  "K'Sante",
  "LeBlanc",
  "Lee Sin",
  "Leona",
  "Lillia",
  "Lissandra",
  "Locke",
  "Lucian",
  "Lulu",
  "Lux",
  "Malphite",
  "Malzahar",
  "Maokai",
  "Master Yi",
  "Mel",
  "Milio",
  "Miss Fortune",
  "Wukong",
  "Mordekaiser",
  "Morgana",
  "Naafiri",
  "Nami",
  "Nasus",
  "Nautilus",
  "Neeko",
  "Nidalee",
  "Nilah",
  "Nocturne",
  "Nunu & Willump",
  "Olaf",
  "Orianna",
  "Ornn",
  "Pantheon",
  "Poppy",
  "Pyke",
  "Qiyana",
  "Quinn",
  "Rakan",
  "Rammus",
  "Rek'Sai",
  "Rell",
  "Renata Glasc",
  "Renekton",
  "Rengar",
  "Riven",
  "Rumble",
  "Ryze",
  "Samira",
  "Sejuani",
  "Senna",
  "Seraphine",
  "Sett",
  "Shaco",
  "Shen",
  "Shyvana",
  "Singed",
  "Sion",
  "Sivir",
  "Skarner",
  "Smolder",
  "Sona",
  "Soraka",
  "Swain",
  "Sylas",
  "Syndra",
  "Tahm Kench",
  "Taliyah",
  "Talon",
  "Taric",
  "Teemo",
  "Thresh",
  "Tristana",
  "Trundle",
  "Tryndamere",
  "Twisted Fate",
  "Twitch",
  "Udyr",
  "Urgot",
  "Varus",
  "Vayne",
  "Veigar",
  "Vel'Koz",
  "Vex",
  "Vi",
  "Viego",
  "Viktor",
  "Vladimir",
  "Volibear",
  "Warwick",
  "Xayah",
  "Xerath",
  "Xin Zhao",
  "Yasuo",
  "Yone",
  "Yorick",
  "Yunara",
  "Yuumi",
  "Zaahen",
  "Zac",
  "Zed",
  "Zeri",
  "Ziggs",
  "Zilean",
  "Zoe",
  "Zyra",
];

const state = {
  activeRoute: "dashboard",
  activeMatchId: "",
  matches: [],
  user: null,
  publicProfile: null,
  publicRoute: null,
  language: localStorage.getItem(LANGUAGE_STORAGE_KEY) || "pl",
  backendAvailable: false,
  riotStatus: null,
  resetToken: "",
  isAutoSyncing: false,
  visibleMatchCount: 8,
  friends: loadFriends(),
  friendProfiles: new Map(),
  filters: {
    championSearch: "",
    collectionMode: "won",
    collectionSort: "wins",
  },
};

const dom = {};

document.documentElement.dataset.appVersion = APP_VERSION;

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  setDefaultFormValues();
  bindEvents();
  state.matches = loadMatches();
  syncFiltersFromDom();
  updateRoute();
  render();
  initializeBackend();
});

function cacheDom() {
  Object.assign(dom, {
    accountMenu: document.getElementById("accountMenu"),
    accountMenuButton: document.getElementById("accountMenuButton"),
    accountAvatar: document.getElementById("accountAvatar"),
    accountMenuLabel: document.getElementById("accountMenuLabel"),
    landingSearch: document.getElementById("landingSearch"),
    playerSearchForms: document.querySelectorAll("[data-player-search-form]"),
    profileHeroAvatar: document.getElementById("profileHeroAvatar"),
    profileHeroName: document.getElementById("profileHeroName"),
    profileHeroMeta: document.getElementById("profileHeroMeta"),
    profileSyncButton: document.getElementById("profileSyncButton"),
    profileSyncNote: document.getElementById("profileSyncNote"),
    exportProgressButton: document.getElementById("exportProgressButton"),
    languageSelect: document.getElementById("languageSelect"),
    accountOverlay: document.getElementById("accountOverlay"),
    accountOverlayBackdrop: document.getElementById("accountOverlayBackdrop"),
    accountOverlayClose: document.getElementById("accountOverlayClose"),
    accountDialogAvatar: document.getElementById("accountDialogAvatar"),
    championSearchInput: document.getElementById("championSearchInput"),
    championSortSelect: document.getElementById("championSortSelect"),
    collectionModeButtons: document.querySelectorAll("[data-collection-mode]"),
    progressCounter: document.getElementById("progressCounter"),
    victoryProgress: document.getElementById("victoryProgress"),
    metricsGrid: document.getElementById("metricsGrid"),
    wonChampionStrip: document.getElementById("wonChampionStrip"),
    partnerStats: document.getElementById("partnerStats"),
    friendRanking: document.getElementById("friendRanking"),
    recentMatches: document.getElementById("recentMatches"),
    matchList: document.getElementById("matchList"),
    showMoreMatchesButton: document.getElementById("showMoreMatchesButton"),
    collectionStatus: document.getElementById("collectionStatus"),
    championCollection: document.getElementById("championCollection"),
    championDetailOverlay: document.getElementById("championDetailOverlay"),
    championDetailBackdrop: document.getElementById("championDetailBackdrop"),
    championDetailClose: document.getElementById("championDetailClose"),
    championDetailIcon: document.getElementById("championDetailIcon"),
    championDetailTitle: document.getElementById("championDetailTitle"),
    championDetailStats: document.getElementById("championDetailStats"),
    championDetailHistory: document.getElementById("championDetailHistory"),
    matchDetailOverlay: document.getElementById("matchDetailOverlay"),
    matchDetailBackdrop: document.getElementById("matchDetailBackdrop"),
    matchDetailClose: document.getElementById("matchDetailClose"),
    matchDetailTitle: document.getElementById("matchDetailTitle"),
    matchDetailStats: document.getElementById("matchDetailStats"),
    matchDetailTeam: document.getElementById("matchDetailTeam"),
    matchDetailAugments: document.getElementById("matchDetailAugments"),
    matchDetailItems: document.getElementById("matchDetailItems"),
    matchDetailPageTitle: document.getElementById("matchDetailPageTitle"),
    matchDetailPageStats: document.getElementById("matchDetailPageStats"),
    matchDetailPagePlayers: document.getElementById("matchDetailPagePlayers"),
    matchDetailPageAugments: document.getElementById("matchDetailPageAugments"),
    matchDetailPageItems: document.getElementById("matchDetailPageItems"),
    publicProfileAvatar: document.getElementById("publicProfileAvatar"),
    publicProfileTitle: document.getElementById("publicProfileTitle"),
    publicProgressCounter: document.getElementById("publicProgressCounter"),
    publicVictoryProgress: document.getElementById("publicVictoryProgress"),
    publicWonChampions: document.getElementById("publicWonChampions"),
    publicMissingChampions: document.getElementById("publicMissingChampions"),
    publicTopDuo: document.getElementById("publicTopDuo"),
    friendForm: document.getElementById("friendForm"),
    friendRiotId: document.getElementById("friendRiotId"),
    friendRegion: document.getElementById("friendRegion"),
    accountTitle: document.getElementById("accountTitle"),
    accountStatus: document.getElementById("accountStatus"),
    authForms: document.getElementById("authForms"),
    authSwitches: document.querySelectorAll("[data-auth-switch]"),
    authPanels: document.querySelectorAll("[data-auth-panel]"),
    loginForm: document.getElementById("loginForm"),
    registerForm: document.getElementById("registerForm"),
    resetPasswordForm: document.getElementById("resetPasswordForm"),
    confirmResetForm: document.getElementById("confirmResetForm"),
    confirmResetPassword: document.getElementById("confirmResetPassword"),
    resetTokenStatus: document.getElementById("resetTokenStatus"),
    logoutButton: document.getElementById("logoutButton"),
    profilePanel: document.getElementById("profilePanel"),
    profileAvatar: document.getElementById("profileAvatar"),
    profileName: document.getElementById("profileName"),
    profileEmail: document.getElementById("profileEmail"),
    riotProfileForm: document.getElementById("riotProfileForm"),
    riotGameName: document.getElementById("riotGameName"),
    riotTagLine: document.getElementById("riotTagLine"),
    riotRouting: document.getElementById("riotRouting"),
    riotRegion: document.getElementById("riotRegion"),
    riotSyncStatus: document.getElementById("riotSyncStatus"),
    publicProfileLinkBox: document.getElementById("publicProfileLinkBox"),
    publicProfileLink: document.getElementById("publicProfileLink"),
    toast: document.getElementById("toast"),
    emptyStateTemplate: document.getElementById("emptyStateTemplate"),
  });
}

function setDefaultFormValues() {
  // Kept for the offline bootstrap path; manual match entry was removed from the UI.
}

async function initializeBackend() {
  try {
    state.riotStatus = await apiRequest("/api/health");
    state.backendAvailable = true;

    try {
      const session = await apiRequest("/api/auth/me");
      state.user = session.user;
      await loadServerMatches();
      render();
      await syncRiotMatches({ automatic: true });
    } catch (error) {
      if (error.status !== 401) throw error;
    }
  } catch {
    state.backendAvailable = false;
    state.user = null;
  }

  fillRiotProfileForm();
  render();
}

function bindEvents() {
  window.addEventListener("hashchange", updateRoute);
  dom.languageSelect.value = state.language;
  applyLanguage();

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      closeAccountOverlay();
      setActiveRoute(link.dataset.route);
    });
  });

  dom.accountMenuButton.addEventListener("click", () => {
    openAccountOverlay(state.user ? "profile" : "login");
  });

  dom.accountOverlayBackdrop.addEventListener("click", closeAccountOverlay);
  dom.accountOverlayClose.addEventListener("click", closeAccountOverlay);

  dom.profileSyncButton.addEventListener("click", async () => {
    await syncRiotMatches({ automatic: false, deep: true });
  });

  dom.exportProgressButton.addEventListener("click", exportProgressPng);

  dom.playerSearchForms.forEach((form) => {
    form.addEventListener("submit", handlePlayerSearchSubmit);
  });

  dom.languageSelect.addEventListener("change", () => {
    state.language = dom.languageSelect.value === "en" ? "en" : "pl";
    localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language);
    applyLanguage();
    render();
  });

  dom.championSearchInput.addEventListener("input", () => {
    state.filters.championSearch = dom.championSearchInput.value;
    renderChampionCollection(getSortedMatches());
  });

  dom.championSortSelect.addEventListener("change", () => {
    state.filters.collectionSort = dom.championSortSelect.value;
    renderChampionCollection(getSortedMatches());
  });

  dom.showMoreMatchesButton.addEventListener("click", () => {
    state.visibleMatchCount += 8;
    renderHistoryMatches(getSortedMatches());
  });

  dom.collectionModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filters.collectionMode = button.dataset.collectionMode;
      renderChampionCollection(getSortedMatches());
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAccountOverlay();
      closeChampionDetail();
      closeMatchDetail();
    }
  });

  [dom.championCollection, dom.wonChampionStrip].forEach((container) => {
    container.addEventListener("click", (event) => {
      const card = event.target.closest("[data-champion-detail]");
      if (!card) return;
      openChampionDetail(card.dataset.championDetail);
    });
  });

  dom.championDetailBackdrop.addEventListener("click", closeChampionDetail);
  dom.championDetailClose.addEventListener("click", closeChampionDetail);
  dom.championDetailHistory.addEventListener("click", (event) => {
    const row = event.target.closest("[data-match-detail]");
    if (!row) return;
    closeChampionDetail();
    openMatchDetail(row.dataset.matchDetail);
  });

  [dom.matchList, dom.recentMatches].forEach((container) => {
    container.addEventListener("click", (event) => {
      const card = event.target.closest("[data-match-detail]");
      if (!card) return;
      openMatchDetail(card.dataset.matchDetail);
    });
  });

  dom.matchDetailBackdrop.addEventListener("click", closeMatchDetail);
  dom.matchDetailClose.addEventListener("click", closeMatchDetail);
  dom.matchDetailPagePlayers.addEventListener("click", (event) => {
    const player = event.target.closest("[data-player-profile]");
    if (!player) return;
    openPlayerProfile(player.dataset.playerProfile, player.dataset.playerRegion);
  });

  dom.friendForm.addEventListener("submit", handleFriendSubmit);
  dom.friendRanking.addEventListener("click", (event) => {
    const friend = event.target.closest("[data-friend-profile]");
    if (!friend) return;
    openPlayerProfile(friend.dataset.friendProfile, friend.dataset.friendRegion);
  });

  dom.authSwitches.forEach((switchButton) => {
    switchButton.addEventListener("click", () => setAuthTab(switchButton.dataset.authSwitch));
  });

  dom.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitAuthForm(dom.loginForm, "/api/auth/login", "Zalogowano.");
  });

  dom.registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitAuthForm(dom.registerForm, "/api/auth/register", "Utworzono konto.");
  });

  dom.resetPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await requestPasswordReset();
  });

  dom.confirmResetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await confirmPasswordReset();
  });

  dom.logoutButton.addEventListener("click", logout);

  dom.riotProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveRiotProfile();
  });
}

function setActiveRoute(route) {
  state.activeRoute = route;
  document.body.classList.toggle("is-public-route", route === "public-profile");
  document.body.classList.toggle("is-guest-home", !state.user && route === "dashboard" && !state.publicRoute);
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.route === route);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-visible", view.dataset.view === route);
  });
}

function setAuthTab(tabName) {
  const titleByTab = {
    login: "Zaloguj",
    register: "Rejestracja",
    reset: "Reset hasła",
  };
  dom.accountTitle.textContent = titleByTab[tabName] || "Zaloguj";
  if (!state.user) {
    dom.accountStatus.replaceChildren();
    dom.accountStatus.classList.add("is-hidden");
    dom.accountStatus.classList.remove("is-error", "is-success");
  }
  dom.authPanels.forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.authPanel === tabName);
  });
}

function openAccountOverlay(tabName = "login") {
  if (!state.user) setAuthTab(tabName === "profile" ? "login" : tabName);
  dom.accountOverlay.classList.add("is-open");
  dom.accountOverlay.setAttribute("aria-hidden", "false");
  dom.accountMenuButton.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => {
    const target = state.user
      ? dom.riotGameName
      : dom.accountOverlay.querySelector("[data-auth-panel].is-visible input");
    target?.focus();
  });
}

function openChampionDetail(champion) {
  const matches = getSortedMatches().filter((match) => match.champion === champion);
  const stat = getChampionStats(matches)[0] || {
    champion,
    games: 0,
    wins: 0,
    avg: 0,
  };

  dom.championDetailIcon.replaceChildren(renderChampionIcon(champion));
  dom.championDetailTitle.textContent = champion;
  dom.championDetailStats.replaceChildren(
    renderDetailStat("Wygrane", stat.wins),
    renderDetailStat("Gry", stat.games),
    renderDetailStat("Średnie miejsce", formatAveragePlacement(stat.avg)),
  );
  dom.championDetailHistory.replaceChildren(
    ...(matches.length
      ? matches.map((match) => {
          const row = el("button", "detail-history-row");
          row.type = "button";
          row.dataset.matchDetail = match.id;
          row.append(
            el("strong", "", `#${match.placement}`),
            el("span", "", formatTeamTitle(match)),
          );
          return row;
        })
      : [el("article", "detail-history-row", "Brak zapisanych gier tym championem.")]),
  );
  dom.championDetailOverlay.classList.add("is-open");
  dom.championDetailOverlay.setAttribute("aria-hidden", "false");
}

function closeChampionDetail() {
  dom.championDetailOverlay.classList.remove("is-open");
  dom.championDetailOverlay.setAttribute("aria-hidden", "true");
}

function openMatchDetail(matchId) {
  if (!matchId) return;
  window.location.hash = `match/${encodeURIComponent(matchId)}`;
}

function closeMatchDetail() {
  dom.matchDetailOverlay.classList.remove("is-open");
  dom.matchDetailOverlay.setAttribute("aria-hidden", "true");
}

function renderMatchDetailPage() {
  if (!dom.matchDetailPageTitle) return;
  const match = state.matches.find((item) => item.id === state.activeMatchId);
  if (!match) {
    dom.matchDetailPageTitle.textContent = "Mecz";
    dom.matchDetailPageStats.replaceChildren(renderDetailStat("Status", "Brak danych"));
    dom.matchDetailPagePlayers.replaceChildren(emptyState("Nie znaleziono meczu.", "Wróć do historii i wybierz pozycję jeszcze raz."));
    dom.matchDetailPageAugments.replaceChildren();
    dom.matchDetailPageItems.replaceChildren();
    return;
  }

  dom.matchDetailPageTitle.textContent = `${formatDate(match.date)} · #${match.placement}`;
  dom.matchDetailPageStats.replaceChildren(
    renderDetailStat("Data", formatDate(match.date)),
    renderDetailStat("Patch", match.patch),
    renderDetailStat("Miejsce", `#${match.placement}`),
  );
  dom.matchDetailPagePlayers.replaceChildren(...renderMatchPlayers(match));
  renderAssetTags(dom.matchDetailPageAugments, match.augments, "Brak augmentów");
  renderAssetTags(dom.matchDetailPageItems, match.items, "Brak itemów");
}

function renderMatchPlayers(match) {
  const players = getMatchPlayers(match);
  if (!players.length) return [emptyState("Brak pełnej listy graczy.", "Kolejna synchronizacja uzupełni nowszy format meczu.")];
  return players
    .sort((a, b) => Number(a.placement || ARENA_MAX_PLACEMENT) - Number(b.placement || ARENA_MAX_PLACEMENT))
    .map((player) => {
      const root = el("button", "player-detail-card");
      root.type = "button";
      root.dataset.playerProfile = player.riotId || "";
      root.dataset.playerRegion = state.user?.riotProfile?.region || "euw1";
      root.disabled = !player.riotId;
      root.append(
        renderChampionIcon(player.champion),
        el("strong", "", player.champion || "Unknown"),
        el("span", "", player.riotId || "Nieznany gracz"),
        el("em", "", `#${player.placement || "-"}`),
      );
      return root;
    });
}

function renderMatchTeam(match) {
  const members = [
    { champion: match.champion, riotId: state.user?.riotProfile ? `${state.user.riotProfile.gameName}#${state.user.riotProfile.tagLine}` : "" },
    ...(Array.isArray(match.teammates) ? match.teammates : []),
  ];

  return members.map((member) => {
    const root = el("article", "team-detail-card");
    root.append(
      renderChampionIcon(member.champion),
      el("strong", "", member.champion || member.riotId || "-"),
    );
    if (member.riotId) root.append(el("span", "", member.riotId));
    return root;
  });
}

function renderDetailStat(label, value) {
  const root = el("article", "detail-stat");
  root.append(el("span", "", label), el("strong", "", value));
  return root;
}

function closeAccountOverlay() {
  dom.accountOverlay.classList.remove("is-open");
  dom.accountOverlay.setAttribute("aria-hidden", "true");
  dom.accountMenuButton.setAttribute("aria-expanded", "false");
  if (window.location.hash.startsWith("#account")) {
    window.history.replaceState(null, "", `#${state.activeRoute || "dashboard"}`);
  }
}

function handlePlayerSearchSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  openPlayerProfile(formData.get("riotId"), formData.get("region"));
}

function handleFriendSubmit(event) {
  event.preventDefault();
  const formData = new FormData(dom.friendForm);
  const parsed = parseRiotId(formData.get("riotId"));
  if (!parsed) {
    announce("Podaj Riot ID znajomego w formacie Nazwa#Tag.");
    return;
  }

  const region = normalizeRegion(formData.get("region"));
  const key = friendKey(region, parsed);
  if (!state.friends.some((friend) => friend.key === key)) {
    state.friends.push({
      key,
      region,
      riotId: `${parsed.gameName}#${parsed.tagLine}`,
      slug: `${parsed.gameName}-${parsed.tagLine}`,
    });
    persistFriends();
  }

  dom.friendRiotId.value = "";
  renderFriendRanking(getSortedMatches());
}

function openPlayerProfile(riotId, region) {
  const parsed = parseRiotId(riotId);
  if (!parsed) {
    announce("Podaj Riot ID w formacie Nazwa#Tag.");
    return;
  }

  const path = `/${publicRegionSlug(region)}/${encodeURIComponent(`${parsed.gameName}-${parsed.tagLine}`)}`;
  window.history.pushState(null, "", path);
  updateRoute();
}

function parseRiotId(value) {
  const text = cleanText(value);
  if (!text) return null;
  const [gameName, tagLine] = text.includes("#") ? text.split("#") : text.split("-");
  if (!cleanText(gameName) || !cleanText(tagLine)) return null;
  return {
    gameName: cleanText(gameName),
    tagLine: cleanText(tagLine).replace(/^#/, ""),
  };
}

function friendKey(region, parsed) {
  return `${normalizeRegion(region)}:${normalizeLookupKey(parsed.gameName)}:${normalizeLookupKey(parsed.tagLine)}`;
}

function updateRoute() {
  const publicRoute = parsePublicRoute();
  if (publicRoute) {
    closeAccountOverlay();
    state.publicRoute = publicRoute;
    setActiveRoute("public-profile");
    loadPublicProfile(publicRoute);
    renderResetTokenView();
    return;
  }

  const rawRoute = window.location.hash.replace("#", "") || "dashboard";
  const [route, token] = rawRoute.split("/");
  state.publicRoute = null;
  state.resetToken = route === "reset-password" ? decodeURIComponent(token || "") : "";
  if (route === "match") {
    state.activeMatchId = decodeURIComponent(token || "");
    setActiveRoute("match-detail");
    closeAccountOverlay();
    renderMatchDetailPage();
    renderResetTokenView();
    return;
  }
  if (route === "account") {
    setActiveRoute(state.activeRoute || "dashboard");
    openAccountOverlay(token || "login");
    renderResetTokenView();
    return;
  }
  closeAccountOverlay();
  state.activeMatchId = "";
  const knownRoute = document.querySelector(`[data-view="${route}"]`) ? route : "dashboard";
  setActiveRoute(knownRoute);
  renderResetTokenView();
}

function parsePublicRoute() {
  if (window.location.hash) return null;
  const segments = window.location.pathname.split("/").filter(Boolean);
  if (segments.length < 2 || segments[0].includes(".")) return null;
  return {
    region: segments[0],
    slug: safeDecode(segments.slice(1).join("/")),
  };
}

async function loadPublicProfile(route) {
  const routeKey = `${route.region}/${route.slug}`;
  if (state.publicProfile?.routeKey === routeKey && !state.publicProfile.loading) return;

  state.publicProfile = { routeKey, loading: true, error: "" };
  renderPublicProfile();

  try {
    const params = new URLSearchParams({ region: route.region, slug: route.slug });
    state.publicProfile = {
      routeKey,
      loading: false,
      error: "",
      data: await apiRequest(`/api/public-profile?${params.toString()}`),
    };
  } catch (error) {
    state.publicProfile = { routeKey, loading: false, error: error.message };
  }

  renderPublicProfile();
}

function syncFiltersFromDom() {
  // Collection filters are owned by the Wygrane view.
}

function render() {
  document.body.classList.toggle("is-guest-home", !state.user && state.activeRoute === "dashboard" && !state.publicRoute);
  const matches = getSortedMatches();
  renderProfileHero(matches);
  renderVictoryProgress(matches);
  renderMetrics(matches);
  renderWonChampionStrip(matches);
  renderPartnerStats(matches);
  renderFriendRanking(matches);
  renderMatchList(dom.recentMatches, matches.slice(0, 5), { compact: true });
  renderHistoryMatches(matches);
  renderChampionCollection(matches);
  renderMatchDetailPage();
  renderPublicProfile();
  renderAccount();
  renderResetTokenView();
}

function renderProfileHero(matches) {
  const profile = state.user?.riotProfile;
  const won = getWonChampionStats(matches).length;
  const total = CHAMPIONS.length;
  dom.profileHeroAvatar.src = getAccountAvatarSrc() || DEFAULT_AUTH_AVATAR;
  dom.profileHeroName.textContent = profile ? `${profile.gameName}#${profile.tagLine}` : "ArenaTracker";

  const meta = [];
  if (profile?.region) meta.push(regionLabel(profile.region));
  meta.push(`${won} / ${total} ${state.language === "en" ? "champions won" : "z wygraną"}`);
  if (profile?.lastSyncedAt) {
    meta.push(`${state.language === "en" ? "Last sync" : "Ostatni sync"}: ${relativeTime(profile.lastSyncedAt)}`);
  }
  dom.profileHeroMeta.replaceChildren(...meta.map((item) => el("span", "profile-meta-pill", item)));

  const canSync = Boolean(state.user?.riotProfile && state.backendAvailable && !state.isAutoSyncing);
  dom.profileSyncButton.disabled = !canSync;
  dom.exportProgressButton.disabled = !matches.length;
  dom.profileSyncNote.textContent = state.isAutoSyncing
    ? "Synchronizuję..."
    : profile
      ? ""
      : state.language === "en"
        ? "Log in and save League profile to sync."
        : "Zaloguj się i zapisz konto League, żeby synchronizować.";
}

function renderVictoryProgress(matches) {
  const won = getWonChampionStats(matches);
  const total = CHAMPIONS.length;
  const completed = won.length;
  const percent = total ? (completed / total) * 100 : 0;

  dom.progressCounter.textContent = `${completed} / ${total}`;
  dom.victoryProgress.style.setProperty("--progress", `${percent}%`);
  dom.victoryProgress.querySelector("span").style.width = `${percent}%`;
  dom.victoryProgress.setAttribute("aria-label", `${completed} z ${total} championów z wygraną`);
}

function renderAccount() {
  dom.accountMenuLabel.textContent = state.user ? state.user.displayName : "Konto";
  updateAccountAvatars();
  renderAccountPublicLink();

  dom.authForms.classList.toggle("is-hidden", Boolean(state.user));
  dom.profilePanel.classList.toggle("is-hidden", !state.user);

  if (!state.user) {
    dom.accountTitle.textContent ||= "Zaloguj";
    dom.profileName.textContent = "Konto";
    dom.profileEmail.textContent = "";
    dom.riotSyncStatus.replaceChildren(
      el("strong", "", "Po zalogowaniu zapiszesz konto League."),
      el("span", "", state.backendAvailable ? "Synchronizacja ruszy automatycznie." : "Uruchom node server.js."),
    );
    return;
  }

  dom.accountTitle.textContent = "Konto";
  dom.accountStatus.replaceChildren();
  dom.accountStatus.classList.add("is-hidden");
  dom.profileName.textContent = state.user.displayName;
  dom.profileEmail.textContent = state.user.email;

  const profile = state.user.riotProfile;
  if (!profile) {
    dom.riotSyncStatus.replaceChildren(
      el("strong", "", "Konto League nie jest jeszcze zapisane."),
      el("span", "", "Po zapisaniu synchronizacja Areny uruchomi się automatycznie."),
    );
    return;
  }

  dom.riotSyncStatus.replaceChildren(
    el("strong", "", `${profile.gameName}#${profile.tagLine}`),
    el(
      "span",
      "",
      profile.lastSyncedAt
        ? `Ostatni sync: ${relativeTime(profile.lastSyncedAt)}.`
        : profile.verifiedAt
          ? `Zweryfikowano: ${formatDate(profile.verifiedAt)}.`
          : "Profil zapisany lokalnie.",
    ),
  );
}

function renderAccountPublicLink() {
  const path = state.user?.riotProfile?.publicPath;
  dom.publicProfileLinkBox.classList.toggle("is-hidden", !path);
  if (!path) {
    dom.publicProfileLink.removeAttribute("href");
    dom.publicProfileLink.textContent = "";
    return;
  }

  const url = `${window.location.origin}${path}`;
  dom.publicProfileLink.href = path;
  dom.publicProfileLink.textContent = url.replace(/^https?:\/\//, "");
}

function renderPublicProfile() {
  if (!dom.publicProfileTitle) return;
  const publicState = state.publicProfile;

  if (!publicState || !state.publicRoute) {
    dom.publicProfileTitle.textContent = "ArenaTracker";
    renderPublicProgress({ won: 0, total: CHAMPIONS.length });
    dom.publicWonChampions.replaceChildren();
    dom.publicMissingChampions.replaceChildren();
    dom.publicTopDuo.replaceChildren();
    return;
  }

  if (publicState.loading) {
    dom.publicProfileTitle.textContent = "Synchronizuję...";
    renderPublicProgress({ won: 0, total: CHAMPIONS.length });
    dom.publicWonChampions.replaceChildren(emptyState("Ładuję profil.", "Chwila."));
    dom.publicMissingChampions.replaceChildren();
    dom.publicTopDuo.replaceChildren();
    return;
  }

  if (publicState.error) {
    dom.publicProfileTitle.textContent = "Nie znaleziono profilu";
    renderPublicProgress({ won: 0, total: CHAMPIONS.length });
    dom.publicWonChampions.replaceChildren(emptyState(publicState.error, "Sprawdź region i nazwę w linku."));
    dom.publicMissingChampions.replaceChildren();
    dom.publicTopDuo.replaceChildren();
    return;
  }

  const data = publicState.data;
  dom.publicProfileAvatar.src = data.profile.profileIconUrl || DEFAULT_AUTH_AVATAR;
  dom.publicProfileTitle.textContent = `${data.profile.gameName}#${data.profile.tagLine}`;
  renderPublicProgress(data.progress);
  dom.publicWonChampions.replaceChildren(
    ...(data.wonChampions.length
      ? data.wonChampions.map((stat) => renderPublicChampionCard(stat, `${stat.wins} win · śr. #${formatAveragePlacement(stat.averagePlacement)}`))
      : [emptyState("Brak wygranych championów.", "Publiczny profil uzupełni się po synchronizacji.")]),
  );
  dom.publicMissingChampions.replaceChildren(
    ...(data.missingChampions.length
      ? data.missingChampions
          .slice(0, 24)
          .map((stat) => renderPublicChampionCard(stat, "Brakuje wygranej", false))
      : [emptyState("Kolekcja zamknięta.", "Każdy champion ma wygraną.")]),
  );
  dom.publicTopDuo.replaceChildren(
    ...(data.topDuo.length
      ? data.topDuo.map((stat) => {
          const root = el("article", "partner-card");
          root.append(
            el("strong", "", stat.name),
            el("span", "", `${stat.games} gier · średnio #${formatAveragePlacement(stat.averagePlacement)}`),
          );
          return root;
        })
      : [emptyState("Brak danych duo.", "Synchronizacja uzupełni partnerów.")]),
  );
}

function renderPublicProgress(progress) {
  const won = Number(progress?.won || 0);
  const total = Number(progress?.total || CHAMPIONS.length);
  const percent = total ? (won / total) * 100 : 0;
  dom.publicProgressCounter.textContent = `${won} / ${total}`;
  dom.publicVictoryProgress.style.setProperty("--progress", `${percent}%`);
  dom.publicVictoryProgress.querySelector("span").style.width = `${percent}%`;
}

function renderPublicChampionCard(stat, caption, complete = true) {
  const root = el("article", `champion-collection-card ${complete ? "is-complete" : "is-missing"} public-card`);
  const icon = stat.icon ? imageIcon(stat.icon, "champion-icon") : renderChampionIcon(stat.champion);
  const body = el("div", "champion-card-copy");
  body.append(el("strong", "", stat.champion), el("span", "", caption));
  root.append(icon, body);
  return root;
}

function updateAccountAvatars() {
  const src = getAccountAvatarSrc();
  [dom.accountAvatar, dom.accountDialogAvatar, dom.profileAvatar, dom.profileHeroAvatar].forEach((image) => {
    image.src = src;
    image.classList.toggle("is-hidden", !src);
  });
}

function getAccountAvatarSrc() {
  return state.user?.riotProfile?.profileIconUrl || DEFAULT_AUTH_AVATAR;
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  dom.languageSelect.value = state.language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
}

function t(key) {
  return translations[state.language]?.[key] || translations.pl[key] || key;
}

function regionLabel(region) {
  const labels = {
    br1: "BR",
    eun1: "EUNE",
    euw1: "EUW",
    jp1: "JP",
    kr: "KR",
    la1: "LAN",
    la2: "LAS",
    na1: "NA",
    oc1: "OCE",
    tr1: "TR",
  };
  return labels[region] || String(region || "").toUpperCase();
}

function normalizeRegion(region) {
  const value = cleanText(region).toLowerCase();
  const aliases = {
    br: "br1",
    eune: "eun1",
    euw: "euw1",
    jp: "jp1",
    lan: "la1",
    las: "la2",
    na: "na1",
    oce: "oc1",
    tr: "tr1",
  };
  return aliases[value] || value || "euw1";
}

function publicRegionSlug(region) {
  return regionLabel(normalizeRegion(region)).toLowerCase();
}

function getSortedMatches() {
  return [...state.matches]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderMetrics(matches) {
  const games = matches.length;
  const wins = matches.filter((match) => match.placement === 1).length;

  const cards = [
    {
      label: "Gry",
      value: games,
    },
    {
      label: "Wygrane",
      value: wins,
    },
  ];

  dom.metricsGrid.replaceChildren(...cards.map(renderMetricCard));
}

function renderMetricCard(card) {
  const root = el("article", "metric-card");
  root.append(el("div", "metric-label", card.label));
  root.append(el("div", "metric-value", card.value));
  return root;
}

function renderWonChampionStrip(matches) {
  const won = getWonChampionStats(matches);
  if (!won.length) {
    dom.wonChampionStrip.replaceChildren(emptyState());
    return;
  }

  dom.wonChampionStrip.replaceChildren(
    ...won.map((stat) => renderChampionPill(stat)),
  );
}

function renderPartnerStats(matches) {
  const stats = getPartnerStats(matches);
  if (!stats.length) {
    const empty = emptyState();
    empty.querySelector("strong").textContent = "Brak danych o partnerach.";
    empty.querySelector("span").textContent = "Synchronizacja uzupełni graczy z Twojej drużyny.";
    dom.partnerStats.replaceChildren(empty);
    return;
  }

  dom.partnerStats.replaceChildren(
    ...stats.slice(0, 12).map((stat) => {
      const root = el("article", "partner-card");
      root.append(
        el("strong", "", stat.name),
        el("span", "", `${stat.games} gier · średnio #${formatAveragePlacement(stat.avg)}`),
      );
      return root;
    }),
  );
}

function renderFriendRanking(matches) {
  if (!dom.friendRanking) return;

  if (!state.user) {
    dom.friendRanking.replaceChildren(emptyState("Zaloguj się, żeby utworzyć grupę.", "Ranking znajomych jest prywatny dla konta."));
    return;
  }

  const profile = state.user.riotProfile;
  const row = {
    name: profile ? profile.gameName : state.user.displayName,
    riotId: profile ? `${profile.gameName}#${profile.tagLine}` : "",
    region: profile?.region || "euw1",
    progress: getWonChampionStats(matches).length,
    total: CHAMPIONS.length,
    avatar: getAccountAvatarSrc(),
  };
  const friendRows = state.friends.map((friend) => friendRowFromProfile(friend));
  dom.friendRanking.replaceChildren(renderFriendRow(row, 1), ...friendRows.map((friend, index) => renderFriendRow(friend, index + 2)));
  refreshFriendProfiles();
}

function renderFriendRow(friend, index) {
  const root = el(friend.riotId ? "button" : "article", "friend-row");
  if (friend.riotId) {
    root.type = "button";
    root.dataset.friendProfile = friend.riotId;
    root.dataset.friendRegion = friend.region || "euw1";
  }
  root.append(
    el("strong", "friend-rank", `${index}.`),
    friend.avatar ? imageIcon(friend.avatar, "champion-icon") : el("span", "champion-icon is-empty", friend.name.slice(0, 2)),
    el("span", "friend-name", friend.name),
    el("strong", "friend-progress", friend.progressLabel || `${friend.progress} / ${friend.total}`),
  );
  return root;
}

function friendRowFromProfile(friend) {
  const cached = state.friendProfiles.get(friend.key);
  const data = cached?.data;
  return {
    name: data ? `${data.profile.gameName}#${data.profile.tagLine}` : friend.riotId,
    riotId: data ? `${data.profile.gameName}#${data.profile.tagLine}` : friend.riotId,
    region: friend.region,
    progress: data?.progress?.won || 0,
    total: data?.progress?.total || CHAMPIONS.length,
    avatar: data?.profile?.profileIconUrl || "",
    progressLabel: cached?.loading ? "..." : cached?.error ? "brak profilu" : "",
  };
}

function refreshFriendProfiles() {
  state.friends.forEach((friend) => {
    const cached = state.friendProfiles.get(friend.key);
    if (cached?.loading || cached?.data || cached?.error) return;
    state.friendProfiles.set(friend.key, { loading: true });
    const params = new URLSearchParams({ region: publicRegionSlug(friend.region), slug: friend.slug });
    apiRequest(`/api/public-profile?${params.toString()}`)
      .then((data) => state.friendProfiles.set(friend.key, { data }))
      .catch((error) => state.friendProfiles.set(friend.key, { error: error.message }))
      .finally(() => renderFriendRanking(getSortedMatches()));
  });
}

function renderChampionCollection(matches) {
  const stats = getAllChampionCollectionStats(matches);
  const wonCount = stats.filter((stat) => stat.wins > 0).length;
  const search = normalize(state.filters.championSearch);
  const mode = state.filters.collectionMode;
  let collection = stats.filter((stat) => {
    const statusMatches =
      mode === "all" || (mode === "won" && stat.wins > 0) || (mode === "missing" && stat.wins === 0);
    const searchMatches = !search || normalize(stat.champion).includes(search);
    return statusMatches && searchMatches;
  });

  collection = collection.sort((a, b) => {
    if (state.filters.collectionSort === "az") return a.champion.localeCompare(b.champion);
    if (state.filters.collectionSort === "games") return b.games - a.games || a.champion.localeCompare(b.champion);
    if (state.filters.collectionSort === "best") return sortPlacement(a.bestPlacement, b.bestPlacement) || a.champion.localeCompare(b.champion);
    if (state.filters.collectionSort === "avg") return sortPlacement(a.avg, b.avg) || a.champion.localeCompare(b.champion);
    if (state.filters.collectionSort === "missing") {
      const aMissing = a.wins ? 1 : 0;
      const bMissing = b.wins ? 1 : 0;
      return aMissing - bMissing || sortPlacement(a.bestPlacement, b.bestPlacement) || a.champion.localeCompare(b.champion);
    }
    return b.wins - a.wins || a.champion.localeCompare(b.champion);
  });

  dom.collectionStatus.textContent = `Ukończono ${wonCount} z ${CHAMPIONS.length}`;
  dom.collectionModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.collectionMode === mode);
  });

  if (!collection.length) {
    const empty = emptyState();
    empty.querySelector("strong").textContent = "Brak championów dla tych filtrów.";
    empty.querySelector("span").textContent = "Zmień filtr albo zsynchronizuj konto.";
    dom.championCollection.replaceChildren(empty);
    return;
  }
  dom.championCollection.replaceChildren(...collection.map(renderChampionCollectionCard));
}

function renderChampionPill(stat) {
  const root = el("button", "champion-pill");
  root.type = "button";
  root.dataset.championDetail = stat.champion;
  const body = el("div", "champion-card-copy");
  body.append(el("strong", "", stat.champion));
  body.append(el("span", "", `${stat.wins} win`));
  root.append(renderChampionIcon(stat.champion), body);
  return root;
}

function renderChampionCollectionCard(stat) {
  const root = el("button", `champion-collection-card ${stat.wins ? "is-complete" : "is-missing"}`);
  root.type = "button";
  root.dataset.championDetail = stat.champion;
  const body = el("div", "champion-card-copy");
  body.append(el("strong", "", stat.champion));
  body.append(
    el(
      "span",
      "",
      stat.wins
        ? `${stat.wins} win`
        : stat.games
          ? `Najlepsze miejsce #${stat.bestPlacement}`
          : "Brak gier",
    ),
  );
  root.append(renderChampionIcon(stat.champion), body);
  return root;
}

function renderChampionIcon(champion) {
  const championName = canonicalChampionName(champion);
  const src = championName ? CHAMPION_ICONS[championName] : "";
  if (!src) {
    const fallback = el("span", "champion-icon is-empty", championName ? championName.slice(0, 2) : "");
    fallback.setAttribute("aria-hidden", "true");
    return fallback;
  }

  const image = document.createElement("img");
  image.className = "champion-icon";
  image.src = src;
  image.alt = "";
  image.loading = "lazy";
  return image;
}

function renderMatchList(container, matches, options = {}) {
  if (!matches.length) {
    container.replaceChildren(emptyState());
    return;
  }

  container.replaceChildren(...matches.map((match) => renderMatchCard(match, options)));
}

function renderHistoryMatches(matches) {
  const visible = matches.slice(0, state.visibleMatchCount);
  renderMatchList(dom.matchList, visible, { dense: true });
  const hasMore = matches.length > visible.length;
  dom.showMoreMatchesButton.classList.toggle("is-hidden", !hasMore);
  dom.showMoreMatchesButton.textContent = t("actions.showMore");
}

function renderMatchCard(match, options) {
  const root = el("button", "match-card");
  root.type = "button";
  root.dataset.matchDetail = match.id;
  const topLine = el("div", "match-topline");
  const titleCluster = el("div", "match-title-cluster");
  const title = el("strong", "", formatTeamTitle(match));
  titleCluster.append(renderTeamIconStack(match), title);
  const placement = el(
    "span",
    `placement-badge ${match.placement === 1 ? "top" : match.placement >= 5 ? "low" : ""}`,
    `#${match.placement}`,
  );
  topLine.append(titleCluster, placement);

  const meta = el("div", "match-meta");
  meta.append(
    el("span", "tag", formatDate(match.date)),
    el("span", "tag", `Patch ${match.patch}`),
  );

  const augmentLimit = options.compact ? 3 : options.dense ? 4 : 6;
  const itemLimit = options.compact ? 2 : options.dense ? 5 : 7;
  const augmentTags = renderAssetGroup("Augmenty", match.augments, augmentLimit);
  const itemTags = renderAssetGroup("Itemy", match.items, itemLimit);

  root.append(topLine, meta);
  if (augmentTags) root.append(augmentTags);
  if (itemTags) root.append(itemTags);
  if (!options.compact && match.note) root.append(el("span", "match-note", match.note));

  return root;
}

function renderTeamIconStack(match) {
  const stack = el("div", "match-champion-icons");
  [match.champion, ...getPartnerLabels(match)].slice(0, 3).forEach((champion) => {
    stack.append(renderChampionIcon(champion));
  });
  return stack;
}

function renderAssetGroup(label, tags, limit) {
  const visibleTags = tags.slice(0, limit);
  if (!visibleTags.length) return null;
  const root = el("div", "match-asset-group");
  root.append(el("span", "asset-group-label", label));
  const list = el("div", "match-tags");
  visibleTags.forEach((tag) => list.append(renderTagPill(tag)));
  root.append(list);
  return root;
}

function renderAssetTags(container, tags, emptyLabel) {
  container.replaceChildren(...(tags || []).map((tag) => renderTagPill(tag)));
  if (!container.childElementCount) container.replaceChildren(el("span", "tag", emptyLabel));
}

function renderTagPill(tag) {
  const normalized = normalizeAssetTag(tag);
  const root = el("span", "tag asset-tag");
  if (normalized.icon) {
    root.append(imageIcon(normalized.icon, "tag-icon"));
  }
  root.append(el("span", "", normalized.name));
  return root;
}

function loadMatches() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.map(normalizeMatch).filter(Boolean);
  } catch {
    return [];
  }
}

function persistMatches() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.matches));
}

function loadFriends() {
  try {
    const stored = JSON.parse(localStorage.getItem(FRIENDS_STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored
      .map((friend) => {
        const parsed = parseRiotId(friend.riotId || friend.slug);
        if (!parsed) return null;
        const region = normalizeRegion(friend.region);
        return {
          key: friendKey(region, parsed),
          region,
          riotId: `${parsed.gameName}#${parsed.tagLine}`,
          slug: `${parsed.gameName}-${parsed.tagLine}`,
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function persistFriends() {
  localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(state.friends));
}

async function loadServerMatches() {
  const data = await apiRequest("/api/matches");
  state.matches = data.matches.map(normalizeMatch).filter(Boolean);
}

async function submitAuthForm(form, path, message) {
  if (!state.backendAvailable) {
    showAccountMessage("Uruchom node server.js, żeby użyć logowania.", "error");
    return;
  }

  const body = Object.fromEntries(new FormData(form).entries());
  try {
    const data = await apiRequest(path, { method: "POST", body });
    state.user = data.user;
    form.reset();
    fillRiotProfileForm();

    if (state.matches.length) {
      const imported = await apiRequest("/api/matches/import", {
        method: "POST",
        body: { mode: "merge", matches: state.matches },
      });
      state.matches = imported.matches.map(normalizeMatch).filter(Boolean);
    } else {
      await loadServerMatches();
    }

    showAccountMessage(message, "success");
    render();
    await syncRiotMatches({ automatic: true });
  } catch (error) {
    showAccountMessage(error.message, "error");
  }
}

async function requestPasswordReset() {
  if (!state.backendAvailable) {
    announce("Uruchom node server.js, żeby wysłać link resetujący.");
    return;
  }

  const body = Object.fromEntries(new FormData(dom.resetPasswordForm).entries());
  try {
    const data = await apiRequest("/api/auth/request-password-reset", { method: "POST", body });
    dom.resetPasswordForm.reset();
    renderResetRequestResult(data);
  } catch (error) {
    showAccountMessage(error.message, "error");
  }
}

async function confirmPasswordReset() {
  if (!state.resetToken) {
    announce("Brakuje tokenu resetującego.");
    return;
  }

  const body = {
    token: state.resetToken,
    password: dom.confirmResetPassword.value,
  };

  try {
    await apiRequest("/api/auth/reset-password", { method: "POST", body });
    dom.confirmResetForm.reset();
    state.resetToken = "";
    window.history.replaceState(null, "", "#dashboard");
    setActiveRoute("dashboard");
    setAuthTab("login");
    openAccountOverlay("login");
    announce("Hasło zostało zmienione. Możesz się zalogować.");
  } catch (error) {
    announce(error.message);
  }
}

function renderResetRequestResult(data) {
  const title = el("strong", "", "Link resetujący został przygotowany.");
  const note = el(
    "span",
    "",
    "W lokalnej wersji wiadomość trafia do data/password-reset-outbox.json.",
  );

  if (!data.resetUrl) {
    dom.accountStatus.replaceChildren(title, note);
    dom.accountStatus.classList.remove("is-hidden");
    dom.accountStatus.classList.remove("is-error", "is-success");
    dom.accountStatus.classList.add("is-success");
    return;
  }

  const link = document.createElement("a");
  link.href = data.resetUrl;
  link.textContent = "Otwórz lokalny link resetujący";
  link.className = "inline-link";
  dom.accountStatus.replaceChildren(title, note, link);
  dom.accountStatus.classList.remove("is-hidden");
  dom.accountStatus.classList.remove("is-error", "is-success");
  dom.accountStatus.classList.add("is-success");
}

function renderResetTokenView() {
  if (!dom.resetTokenStatus) return;
  dom.resetTokenStatus.replaceChildren(
    el(
      "strong",
      "",
      state.resetToken ? "Token resetu jest aktywny." : "Brakuje tokenu resetującego.",
    ),
    el(
      "span",
      "",
      state.resetToken
        ? "Ustaw nowe hasło dla konta powiązanego z linkiem."
        : "Użyj linku z wiadomości resetującej hasło.",
    ),
  );
  dom.confirmResetForm.classList.toggle("is-hidden", !state.resetToken);
}

function showAccountMessage(message, type = "info") {
  dom.accountStatus.replaceChildren(el("strong", "", message));
  dom.accountStatus.classList.remove("is-hidden", "is-error", "is-success");
  dom.accountStatus.classList.toggle("is-error", type === "error");
  dom.accountStatus.classList.toggle("is-success", type === "success");
}

async function logout() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } finally {
    state.user = null;
    state.matches = loadMatches();
    fillRiotProfileForm();
    setAuthTab("login");
    announce("Wylogowano.");
    render();
  }
}

async function saveRiotProfile() {
  if (!state.user) {
    showAccountMessage("Najpierw zaloguj się do ArenaTracker.", "error");
    return;
  }

  const body = Object.fromEntries(new FormData(dom.riotProfileForm).entries());
  try {
    const data = await apiRequest("/api/riot/profile", { method: "POST", body });
    state.user = data.user;
    fillRiotProfileForm();
    showAccountMessage("Konto League zapisane.", "success");
    render();
    await syncRiotMatches({ automatic: true });
  } catch (error) {
    showAccountMessage(error.message, "error");
  }
}

async function syncRiotMatches(options = {}) {
  if (!state.user) {
    if (!options.automatic) showAccountMessage("Najpierw zaloguj się do ArenaTracker.", "error");
    return;
  }

  if (!state.user.riotProfile) {
    return;
  }

  if (state.isAutoSyncing) {
    return;
  }

  state.isAutoSyncing = true;
  dom.riotSyncStatus.replaceChildren(
    el("strong", "", "Synchronizuję..."),
    el("span", "", "Aktualizuję mecze Areny."),
  );

  try {
    const data = await apiRequest("/api/riot/sync", {
      method: "POST",
      body: {
        limit: options.deep ? RIOT_SEASON_SYNC_LIMIT : RIOT_SYNC_LIMIT,
        scope: options.deep ? "season" : "recent",
      },
    });
    state.user = data.user;
    state.matches = data.matches.map(normalizeMatch).filter(Boolean);
    fillRiotProfileForm();
    if (!options.automatic) showAccountMessage(`Zsynchronizowano ${(data.scannedCount || 0) + (data.reusedCount || 0)} meczów.`, "success");
    render();
  } catch (error) {
    if (!options.automatic) showAccountMessage(error.message, "error");
    render();
  } finally {
    state.isAutoSyncing = false;
    render();
  }
}

function fillRiotProfileForm() {
  const profile = state.user?.riotProfile;
  dom.riotGameName.value = profile?.gameName || "";
  dom.riotTagLine.value = profile?.tagLine || "";
  dom.riotRouting.value = profile?.routing || "europe";
  dom.riotRegion.value = profile?.region || "eun1";
}

async function apiRequest(path, options = {}) {
  const headers = { Accept: "application/json" };
  const request = {
    method: options.method || "GET",
    credentials: "same-origin",
    headers,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    request.body = JSON.stringify(options.body);
  }

  const response = await fetch(path, request);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : {};

  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

function exportMatches() {
  const payload = {
    app: "ArenaTracker",
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    dataDragonVersion: DATA_DRAGON_VERSION,
    matches: state.matches,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `arenatracker-${today()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  announce("Eksport JSON przygotowany.");
}

async function exportProgressPng() {
  const matches = getSortedMatches();
  const wonStats = getWonChampionStats(matches);
  const profile = state.user?.riotProfile;
  const title = profile ? `${profile.gameName}#${profile.tagLine}` : "ArenaTracker";
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f4f4ef";
  ctx.font = "800 54px system-ui, sans-serif";
  ctx.fillText(title, 64, 92);
  ctx.fillStyle = "#9aa19c";
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.fillText(`${wonStats.length} / ${CHAMPIONS.length} wygranych championów`, 64, 140);

  const barX = 64;
  const barY = 190;
  const barW = 1072;
  const barH = 34;
  const percent = CHAMPIONS.length ? wonStats.length / CHAMPIONS.length : 0;
  ctx.fillStyle = "#101212";
  roundRect(ctx, barX, barY, barW, barH, 17);
  ctx.fill();
  const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  gradient.addColorStop(0, "#f4f4ef");
  gradient.addColorStop(0.5, "#c9aa62");
  gradient.addColorStop(1, "#87d48d");
  ctx.fillStyle = gradient;
  roundRect(ctx, barX, barY, Math.max(18, barW * percent), barH, 17);
  ctx.fill();

  ctx.font = "800 24px system-ui, sans-serif";
  wonStats.slice(0, 28).forEach((stat, index) => {
    const x = 64 + (index % 4) * 270;
    const y = 290 + Math.floor(index / 4) * 44;
    ctx.fillStyle = "#f4f4ef";
    ctx.fillText(stat.champion, x, y);
    ctx.fillStyle = "#9aa19c";
    ctx.fillText(`${stat.wins} win`, x + 150, y);
  });

  const link = document.createElement("a");
  link.download = `arenatracker-progress-${today()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  announce("PNG progresu przygotowany.");
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function importMatches(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const imported = Array.isArray(parsed) ? parsed : parsed.matches;
      if (!Array.isArray(imported)) throw new Error("Invalid ArenaTracker export");

      const normalized = imported.map(normalizeMatch).filter(Boolean);
      if (state.user) {
        const data = await apiRequest("/api/matches/import", {
          method: "POST",
          body: { mode: "replace", matches: normalized },
        });
        state.matches = data.matches.map(normalizeMatch).filter(Boolean);
      } else {
        state.matches = normalized;
        persistMatches();
      }
      announce(`Zaimportowano ${normalized.length} meczów.`);
      render();
    } catch (error) {
      window.alert(`Nie udało się zaimportować pliku: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file);
}

function normalizeMatch(match) {
  if (!match || !match.date || !match.champion || !match.placement) return null;
  const teammates = Array.isArray(match.teammates)
    ? match.teammates.map(normalizeTeammate).filter(Boolean)
    : [];
  const players = Array.isArray(match.players)
    ? match.players.map(normalizePlayer).filter(Boolean)
    : [];
  const partner = cleanText(match.partner);

  return {
    id: match.id || makeId(),
    date: cleanText(match.date),
    patch: cleanText(match.patch || DATA_DRAGON_VERSION),
    champion: canonicalChampionName(match.champion),
    partner,
    teammates,
    players,
    placement: clamp(Number(match.placement), 1, ARENA_MAX_PLACEMENT),
    ratingDelta: Number(match.ratingDelta || 0),
    augments: Array.isArray(match.augments)
      ? match.augments.map(resolveAugmentTag).filter(Boolean)
      : [],
    items: Array.isArray(match.items) ? match.items.map(resolveItemTag).filter(Boolean) : [],
    note: normalizeMatchNote(match.note),
    source: match.source && typeof match.source === "object" ? match.source : { type: "manual" },
    createdAt: match.createdAt || new Date().toISOString(),
  };
}

function getChampionStats(matches) {
  const grouped = new Map();

  matches.forEach((match) => {
    const key = match.champion;
    if (!grouped.has(key)) {
      grouped.set(key, {
        champion: key,
        games: 0,
        wins: 0,
        placements: [],
        partners: new Map(),
      });
    }

    const stat = grouped.get(key);
    stat.games += 1;
    stat.placements.push(match.placement);
    if (match.placement === 1) stat.wins += 1;
    getPartnerLabels(match).forEach((partner) => {
      if (match.placement === 1) increment(stat.partners, partner);
    });
  });

  return [...grouped.values()].map((stat) => ({
    ...stat,
    avg: average(stat.placements),
    bestPlacement: Math.min(...stat.placements),
    bestPartner: mapLeader(stat.partners),
  }));
}

function getAllChampionCollectionStats(matches) {
  const statsByChampion = new Map(getChampionStats(matches).map((stat) => [stat.champion, stat]));
  return CHAMPIONS.map((champion) => {
    const stat = statsByChampion.get(champion);
    return {
      champion,
      games: stat?.games || 0,
      wins: stat?.wins || 0,
      placements: stat?.placements || [],
      avg: stat?.avg || 0,
      bestPlacement: stat?.bestPlacement || 0,
      bestPartner: stat?.bestPartner || "",
    };
  });
}

function getWonChampionStats(matches) {
  return getChampionStats(matches)
    .filter((stat) => stat.wins > 0)
    .sort((a, b) => b.wins - a.wins || a.champion.localeCompare(b.champion));
}

function findBestChampion(matches) {
  return getChampionStats(matches)
    .filter((stat) => stat.wins > 0)
    .sort((a, b) => b.wins - a.wins || a.avg - b.avg)[0];
}

function increment(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function getPartnerStats(matches) {
  const partners = new Map();
  matches.forEach((match) => {
    getPartnerLabels(match, { preferPlayers: true }).forEach((name) => {
      if (!partners.has(name)) partners.set(name, { name, games: 0, wins: 0, placements: [] });
      const stat = partners.get(name);
      stat.games += 1;
      stat.placements.push(match.placement);
      if (match.placement === 1) stat.wins += 1;
    });
  });
  return [...partners.values()]
    .map((stat) => ({ ...stat, avg: average(stat.placements) }))
    .sort((a, b) => b.games - a.games || a.avg - b.avg || a.name.localeCompare(b.name));
}

function getPartnerLabels(match, options = {}) {
  const teammates = Array.isArray(match.teammates) ? match.teammates : [];
  const labels = teammates
    .map((teammate) => {
      if (options.preferPlayers && teammate.riotId) return teammate.riotId;
      return teammate.champion || teammate.riotId;
    })
    .filter(Boolean);
  if (labels.length) return labels;
  return match.partner ? [match.partner] : [];
}

function formatTeamTitle(match) {
  const teammateChampions = getPartnerLabels(match).filter(Boolean);
  return [match.champion, ...teammateChampions].join(" + ");
}

function normalizeTeammate(value) {
  if (!value || typeof value !== "object") return null;
  const champion = canonicalChampionName(value.champion);
  const riotId = cleanText(value.riotId);
  if (!champion && !riotId) return null;
  return {
    champion,
    riotId,
    puuid: cleanText(value.puuid),
  };
}

function normalizePlayer(value) {
  if (!value || typeof value !== "object") return null;
  const champion = canonicalChampionName(value.champion);
  const riotId = cleanText(value.riotId);
  if (!champion && !riotId) return null;
  return {
    champion,
    riotId,
    puuid: cleanText(value.puuid),
    placement: clamp(Number(value.placement || value.subteamPlacement || ARENA_MAX_PLACEMENT), 1, ARENA_MAX_PLACEMENT),
    teamId: cleanText(value.teamId || value.playerSubteamId),
  };
}

function getMatchPlayers(match) {
  if (Array.isArray(match.players) && match.players.length) return match.players;
  const ownProfile = state.user?.riotProfile;
  return [
    {
      champion: match.champion,
      riotId: ownProfile ? `${ownProfile.gameName}#${ownProfile.tagLine}` : "",
      placement: match.placement,
    },
    ...(Array.isArray(match.teammates) ? match.teammates.map((teammate) => ({
      ...teammate,
      placement: match.placement,
    })) : []),
  ];
}

function mapLeader(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
}

function resolveItemName(value) {
  return resolveItemTag(value)?.name || "";
}

function resolveItemTag(value) {
  return resolveGameAssetTag(value, GAME_DATA.items, GAME_DATA.itemIcons, GAME_DATA.itemAliases);
}

function resolveAugmentName(value) {
  return resolveAugmentTag(value)?.name || "";
}

function resolveAugmentTag(value) {
  return resolveGameAssetTag(value, GAME_DATA.augments, GAME_DATA.augmentIcons, GAME_DATA.augmentAliases);
}

function resolveGameAssetTag(value, names = {}, icons = {}, aliases = {}) {
  const source = value && typeof value === "object" ? value : {};
  const rawText = source.name ?? source.label ?? value;
  const text = cleanText(rawText);
  const rawId = cleanText(source.id || source.itemId || source.augmentId || extractNumericId(text));
  const aliasId = aliases?.[normalizeLookupKey(text)] || "";
  const id = names?.[rawId] ? rawId : aliasId || rawId;
  const name = names?.[id] || text;
  if (rawId && text === rawId && !names?.[rawId]) return null;
  if (!name) return null;

  return {
    id,
    name,
    icon: cleanText(source.icon || icons?.[id]),
  };
}

function normalizeAssetTag(value) {
  if (value && typeof value === "object") {
    return {
      name: cleanText(value.name || value.label || value.id),
      icon: cleanText(value.icon),
    };
  }
  return {
    name: cleanText(value),
    icon: "",
  };
}

function canonicalChampionName(value) {
  const text = cleanText(value);
  if (!text) return "";
  return CHAMPION_KEYS[text] || CHAMPION_ALIASES[normalizeLookupKey(text)] || text;
}

function normalizeMatchNote(value) {
  const note = cleanText(value);
  return /^Zaimportowano z Riot Match-V5/i.test(note) ? "" : note;
}

function formatAveragePlacement(value) {
  return Number(value || 0) ? Number(value).toFixed(1) : "-";
}

function extractNumericId(value) {
  const match = cleanText(value).match(/\b\d{2,6}\b/);
  return match?.[0] || "";
}

function normalize(value) {
  return cleanText(value).toLocaleLowerCase("pl-PL");
}

function normalizeLookupKey(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return cleanText(value);
  }
}

function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function average(values) {
  return values.length ? sum(values) / values.length : 0;
}

function sortPlacement(a, b) {
  const left = Number(a || 99);
  const right = Number(b || 99);
  return left - right;
}

function percentage(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function today() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function relativeTime(value) {
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return formatDate(value);
  const diffSeconds = Math.round((then - Date.now()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const [unit, seconds] = units.find(([, seconds]) => Math.abs(diffSeconds) >= seconds) || ["second", 1];
  return new Intl.RelativeTimeFormat(state.language === "en" ? "en" : "pl", { numeric: "auto" }).format(
    Math.round(diffSeconds / seconds),
    unit,
  );
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `match-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

let toastTimer;

function announce(message) {
  window.clearTimeout(toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    dom.toast.classList.remove("is-visible");
  }, 2400);
}

function emptyState(title, caption) {
  const node = dom.emptyStateTemplate.content.firstElementChild.cloneNode(true);
  if (title) node.querySelector("strong").textContent = title;
  if (caption) node.querySelector("span").textContent = caption;
  return node;
}

function imageIcon(src, className) {
  const image = document.createElement("img");
  image.className = className;
  image.src = src;
  image.alt = "";
  image.loading = "lazy";
  return image;
}

function el(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
