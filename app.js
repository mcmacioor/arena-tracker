const APP_VERSION = "0.5.0";
const GAME_DATA = globalThis.ARENA_GAME_DATA || {};
const DATA_DRAGON_VERSION = GAME_DATA.version || "16.13.1";
const STORAGE_KEY = "arenatracker.matches.v1";
const CHAMPION_ICONS = GAME_DATA.championIcons || {};
const DEFAULT_AUTH_AVATAR = CHAMPION_ICONS.Malphite || "";
const ARENA_MAX_PLACEMENT = 6;

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
  matches: [],
  user: null,
  backendAvailable: false,
  riotStatus: null,
  resetToken: "",
  isAutoSyncing: false,
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
    recentMatches: document.getElementById("recentMatches"),
    matchList: document.getElementById("matchList"),
    collectionStatus: document.getElementById("collectionStatus"),
    championCollection: document.getElementById("championCollection"),
    championDetailOverlay: document.getElementById("championDetailOverlay"),
    championDetailBackdrop: document.getElementById("championDetailBackdrop"),
    championDetailClose: document.getElementById("championDetailClose"),
    championDetailIcon: document.getElementById("championDetailIcon"),
    championDetailTitle: document.getElementById("championDetailTitle"),
    championDetailStats: document.getElementById("championDetailStats"),
    championDetailHistory: document.getElementById("championDetailHistory"),
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

  dom.championSearchInput.addEventListener("input", () => {
    state.filters.championSearch = dom.championSearchInput.value;
    renderChampionCollection(getSortedMatches());
  });

  dom.championSortSelect.addEventListener("change", () => {
    state.filters.collectionSort = dom.championSortSelect.value;
    renderChampionCollection(getSortedMatches());
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
    bestPartner: "",
  };
  const wonMatches = matches.filter((match) => match.placement === 1);
  const patchCounts = new Map();
  wonMatches.forEach((match) => increment(patchCounts, match.patch));
  const bestPatch = mapLeader(patchCounts) || "-";

  dom.championDetailIcon.replaceChildren(renderChampionIcon(champion));
  dom.championDetailTitle.textContent = champion;
  dom.championDetailStats.replaceChildren(
    renderDetailStat("Wygrane", stat.wins),
    renderDetailStat("Gry", stat.games),
    renderDetailStat("Najczęstszy duo", stat.bestPartner || "-"),
    renderDetailStat("Najlepszy patch", bestPatch),
  );
  dom.championDetailHistory.replaceChildren(
    ...(matches.length
      ? matches.map((match) => {
          const row = el("article", "detail-history-row");
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

function updateRoute() {
  const rawRoute = window.location.hash.replace("#", "") || "dashboard";
  const [route, token] = rawRoute.split("/");
  state.resetToken = route === "reset-password" ? decodeURIComponent(token || "") : "";
  if (route === "account") {
    setActiveRoute(state.activeRoute || "dashboard");
    openAccountOverlay(token || "login");
    renderResetTokenView();
    return;
  }
  closeAccountOverlay();
  const knownRoute = document.querySelector(`[data-view="${route}"]`) ? route : "dashboard";
  setActiveRoute(knownRoute);
  renderResetTokenView();
}

function syncFiltersFromDom() {
  // Collection filters are owned by the Wygrane view.
}

function render() {
  const matches = getSortedMatches();
  renderVictoryProgress(matches);
  renderMetrics(matches);
  renderWonChampionStrip(matches);
  renderPartnerStats(matches);
  renderMatchList(dom.recentMatches, matches.slice(0, 5), { compact: true });
  renderMatchList(dom.matchList, matches);
  renderChampionCollection(matches);
  renderAccount();
  renderResetTokenView();
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
        ? `Ostatni sync: ${formatDate(profile.lastSyncedAt)}.`
        : profile.verifiedAt
          ? `Zweryfikowano: ${formatDate(profile.verifiedAt)}.`
          : "Profil zapisany lokalnie.",
    ),
  );
}

function updateAccountAvatars() {
  const src = getAccountAvatarSrc();
  [dom.accountAvatar, dom.accountDialogAvatar, dom.profileAvatar].forEach((image) => {
    image.src = src;
    image.classList.toggle("is-hidden", !src);
  });
}

function getAccountAvatarSrc() {
  return state.user?.riotProfile?.profileIconUrl || DEFAULT_AUTH_AVATAR;
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
      label: "Mecze",
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
    ...won.slice(0, 18).map((stat) => renderChampionPill(stat)),
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
        el("span", "", `${stat.games} gier · ${percentage(stat.wins / stat.games)} WR`),
      );
      return root;
    }),
  );
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
  body.append(el("span", "", `${stat.wins} win${stat.bestPartner ? ` · ${stat.bestPartner}` : ""}`));
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
        ? `${stat.wins} win${stat.bestPartner ? ` · duo: ${stat.bestPartner}` : ""}`
        : "Brakuje wygranej",
    ),
  );
  root.append(renderChampionIcon(stat.champion), body);
  return root;
}

function renderChampionIcon(champion) {
  const src = champion ? CHAMPION_ICONS[champion] : "";
  if (!src) {
    const fallback = el("span", "champion-icon is-empty", champion ? champion.slice(0, 2) : "");
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

function renderMatchCard(match, options) {
  const root = el("article", "match-card");
  const topLine = el("div", "match-topline");
  const title = el("strong", "", formatTeamTitle(match));
  const placement = el(
    "span",
    `placement-badge ${match.placement === 1 ? "top" : match.placement >= 5 ? "low" : ""}`,
    `#${match.placement}`,
  );
  topLine.append(title, placement);

  const meta = el("div", "match-meta");
  meta.append(
    el("span", "tag", formatDate(match.date)),
    el("span", "tag", `Patch ${match.patch}`),
  );

  const tags = el("div", "match-tags");
  [...match.augments.slice(0, 3), ...match.items.slice(0, options.compact ? 1 : 3)].forEach((tag) => {
    tags.append(el("span", "tag", tag));
  });

  root.append(topLine, meta);
  if (tags.childElementCount) root.append(tags);
  if (!options.compact && match.note) root.append(el("span", "", match.note));

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
      body: { limit: 30 },
    });
    state.user = data.user;
    state.matches = data.matches.map(normalizeMatch).filter(Boolean);
    fillRiotProfileForm();
    if (!options.automatic) showAccountMessage(`Zsynchronizowano ${data.scannedCount} meczów.`, "success");
    render();
  } catch (error) {
    if (!options.automatic) showAccountMessage(error.message, "error");
    render();
  } finally {
    state.isAutoSyncing = false;
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
  const partner = cleanText(match.partner);

  return {
    id: match.id || makeId(),
    date: cleanText(match.date),
    patch: cleanText(match.patch || DATA_DRAGON_VERSION),
    champion: cleanText(match.champion),
    partner,
    teammates,
    placement: clamp(Number(match.placement), 1, ARENA_MAX_PLACEMENT),
    ratingDelta: Number(match.ratingDelta || 0),
    augments: Array.isArray(match.augments)
      ? match.augments.map(resolveAugmentName).map(cleanText).filter(Boolean)
      : [],
    items: Array.isArray(match.items) ? match.items.map(resolveItemName).map(cleanText).filter(Boolean) : [],
    note: cleanText(match.note),
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
      if (!partners.has(name)) partners.set(name, { name, games: 0, wins: 0 });
      const stat = partners.get(name);
      stat.games += 1;
      if (match.placement === 1) stat.wins += 1;
    });
  });
  return [...partners.values()].sort((a, b) => b.games - a.games || b.wins - a.wins || a.name.localeCompare(b.name));
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
  const champion = cleanText(value.champion);
  const riotId = cleanText(value.riotId);
  if (!champion && !riotId) return null;
  return {
    champion,
    riotId,
    puuid: cleanText(value.puuid),
  };
}

function mapLeader(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
}

function resolveItemName(value) {
  const text = cleanText(value);
  const id = extractNumericId(text);
  if (!id) return text;
  return GAME_DATA.items?.[id] || text;
}

function resolveAugmentName(value) {
  const text = cleanText(value);
  const id = extractNumericId(text);
  if (!id) return text;
  return GAME_DATA.augments?.[id] || text;
}

function extractNumericId(value) {
  const match = cleanText(value).match(/\b\d{2,6}\b/);
  return match?.[0] || "";
}

function normalize(value) {
  return cleanText(value).toLocaleLowerCase("pl-PL");
}

function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function average(values) {
  return values.length ? sum(values) / values.length : 0;
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

function emptyState() {
  return dom.emptyStateTemplate.content.firstElementChild.cloneNode(true);
}

function el(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
