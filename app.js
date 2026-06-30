const APP_VERSION = "0.4.0";
const GAME_DATA = globalThis.ARENA_GAME_DATA || {};
const DATA_DRAGON_VERSION = GAME_DATA.version || "16.13.1";
const STORAGE_KEY = "arenatracker.matches.v1";
const CHAMPION_ICONS = GAME_DATA.championIcons || {};

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

const SAMPLE_MATCHES = [
  {
    date: "2026-06-30",
    patch: "16.13",
    champion: "Vi",
    partner: "Galio",
    placement: 1,
    ratingDelta: 84,
    augments: ["Mystic Punch", "Goliath", "Heavy Hitter"],
    items: ["Black Cleaver", "Gargoyle Stoneplate", "Sterak's Gage"],
    note: "Galio peel pozwolił wchodzić agresywnie po drugim augmentcie.",
  },
  {
    date: "2026-06-30",
    patch: "16.13",
    champion: "Gwen",
    partner: "Alistar",
    placement: 2,
    ratingDelta: 58,
    augments: ["Jeweled Gauntlet", "Thread the Needle", "Recursion"],
    items: ["Riftmaker", "Nashor's Tooth", "Zhonya's Hourglass"],
    note: "Trzymać cooldown W na prismatic burst, nie na pierwszy engage.",
  },
  {
    date: "2026-06-29",
    patch: "16.13",
    champion: "Jhin",
    partner: "Maokai",
    placement: 5,
    ratingDelta: -22,
    augments: ["Scoped Weapons", "Deft", "Executioner"],
    items: ["Infinity Edge", "Rapid Firecannon", "Lord Dominik's Regards"],
    note: "Za mało narzędzi na podwójny dive, potrzebny wcześniejszy armor pen.",
  },
  {
    date: "2026-06-28",
    patch: "16.13",
    champion: "Kayn",
    partner: "Yuumi",
    placement: 1,
    ratingDelta: 91,
    augments: ["Blade Waltz", "Goredrink", "Spin to Win"],
    items: ["Sundered Sky", "Death's Dance", "Spirit Visage"],
    note: "Snowball po pierwszym revive; banować mocny disengage.",
  },
  {
    date: "2026-06-27",
    patch: "16.12",
    champion: "Vi",
    partner: "Lulu",
    placement: 3,
    ratingDelta: 21,
    augments: ["Goliath", "Perseverance", "Courage of the Colossus"],
    items: ["Black Cleaver", "Sterak's Gage", "Force of Nature"],
    note: "Dobry sustain, ale brakowało damage'u przeciw tankom.",
  },
  {
    date: "2026-06-26",
    patch: "16.12",
    champion: "Brand",
    partner: "Rammus",
    placement: 2,
    ratingDelta: 63,
    augments: ["Magic Missile", "Eureka", "Witchful Thinking"],
    items: ["Liandry's Torment", "Rylai's Crystal Scepter", "Rabadon's Deathcap"],
    note: "Rammus wymuszał stackowanie wrogów pod pasywkę.",
  },
  {
    date: "2026-06-25",
    patch: "16.12",
    champion: "Samira",
    partner: "Rell",
    placement: 6,
    ratingDelta: -38,
    augments: ["Outlaw's Grit", "Vulnerability", "Lightning Strikes"],
    items: ["The Collector", "Immortal Shieldbow", "Bloodthirster"],
    note: "Duet działa tylko, jeśli pierwszy reset wchodzi przed ring close.",
  },
  {
    date: "2026-06-24",
    patch: "16.12",
    champion: "Vi",
    partner: "Galio",
    placement: 2,
    ratingDelta: 47,
    augments: ["Mystic Punch", "Frost Wraith", "Goliath"],
    items: ["Black Cleaver", "Randuin's Omen", "Sterak's Gage"],
    note: "Powtórzyć: stabilne top 2 przeciw carry + enchanter.",
  },
];

const state = {
  activeRoute: "dashboard",
  matches: [],
  user: null,
  backendAvailable: false,
  riotStatus: null,
  resetToken: "",
  filters: {
    champion: "",
  },
};

const dom = {};

document.documentElement.dataset.appVersion = APP_VERSION;

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  fillChampionPicker();
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
    dataPatch: document.getElementById("dataPatch"),
    seedSampleButton: document.getElementById("seedSampleButton"),
    accountMenu: document.getElementById("accountMenu"),
    accountMenuButton: document.getElementById("accountMenuButton"),
    accountAvatar: document.getElementById("accountAvatar"),
    accountMenuLabel: document.getElementById("accountMenuLabel"),
    accountOverlay: document.getElementById("accountOverlay"),
    accountOverlayBackdrop: document.getElementById("accountOverlayBackdrop"),
    accountOverlayClose: document.getElementById("accountOverlayClose"),
    accountDialogAvatar: document.getElementById("accountDialogAvatar"),
    championPicker: document.getElementById("championPicker"),
    championPickerButton: document.getElementById("championPickerButton"),
    championPickerMenu: document.getElementById("championPickerMenu"),
    championFilterIcon: document.getElementById("championFilterIcon"),
    championFilterLabel: document.getElementById("championFilterLabel"),
    progressCounter: document.getElementById("progressCounter"),
    victoryProgress: document.getElementById("victoryProgress"),
    metricsGrid: document.getElementById("metricsGrid"),
    wonChampionStrip: document.getElementById("wonChampionStrip"),
    recentMatches: document.getElementById("recentMatches"),
    matchList: document.getElementById("matchList"),
    exportButton: document.getElementById("exportButton"),
    importInput: document.getElementById("importInput"),
    collectionStatus: document.getElementById("collectionStatus"),
    championCollection: document.getElementById("championCollection"),
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
    riotKeyStatus: document.getElementById("riotKeyStatus"),
    riotProfileForm: document.getElementById("riotProfileForm"),
    riotGameName: document.getElementById("riotGameName"),
    riotTagLine: document.getElementById("riotTagLine"),
    riotRouting: document.getElementById("riotRouting"),
    riotRegion: document.getElementById("riotRegion"),
    riotSyncButton: document.getElementById("riotSyncButton"),
    riotSyncStatus: document.getElementById("riotSyncStatus"),
    toast: document.getElementById("toast"),
    emptyStateTemplate: document.getElementById("emptyStateTemplate"),
  });

  dom.dataPatch.textContent = DATA_DRAGON_VERSION;
}

function fillChampionPicker() {
  renderChampionPicker([]);
}

function renderChampionPicker(wonStats) {
  const current = state.filters.champion;
  const hasCurrent = !current || wonStats.some((stat) => stat.champion === current);
  if (!hasCurrent) state.filters.champion = "";

  const fragment = document.createDocumentFragment();
  fragment.append(renderChampionPickerOption("", "Wszyscy wygrani"));
  wonStats.forEach((stat) => {
    fragment.append(renderChampionPickerOption(stat.champion, stat.champion));
  });
  dom.championPickerMenu.replaceChildren(fragment);
  updateChampionFilterButton();
}

function renderChampionPickerOption(value, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "champion-picker-option";
  button.classList.toggle("is-all-option", !value);
  button.dataset.champion = value;
  button.setAttribute("role", "option");
  button.setAttribute("aria-selected", value === state.filters.champion ? "true" : "false");
  if (value) button.append(renderChampionIcon(value));
  button.append(el("span", "", label));
  return button;
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

  dom.championPickerButton.addEventListener("click", () => {
    const open = dom.championPicker.classList.toggle("is-open");
    dom.championPickerButton.setAttribute("aria-expanded", String(open));
  });

  dom.championPickerMenu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-champion]");
    if (!option) return;
    setChampionFilter(option.dataset.champion);
  });

  document.addEventListener("click", (event) => {
    if (dom.championPicker.contains(event.target)) return;
    closeChampionPicker();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeChampionPicker();
      closeAccountOverlay();
    }
  });

  dom.seedSampleButton.addEventListener("click", async () => {
    const canSeed =
      state.matches.length === 0 ||
      window.confirm("Zastąpić obecne dane przykładową sesją demo?");
    if (!canSeed) return;

    const sampleMatches = SAMPLE_MATCHES.map((match, index) => ({
      ...match,
      id: `demo-${index + 1}`,
      createdAt: new Date().toISOString(),
    }));

    try {
      if (state.user) {
        const data = await apiRequest("/api/matches/import", {
          method: "POST",
          body: { mode: "replace", matches: sampleMatches },
        });
        state.matches = data.matches.map(normalizeMatch).filter(Boolean);
      } else {
        state.matches = sampleMatches;
        persistMatches();
      }
      announce("Wczytano przykładową sesję demo.");
      render();
    } catch (error) {
      announce(error.message);
    }
  });

  [dom.matchList, dom.recentMatches].forEach((list) => {
    list.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-delete]");
      if (!button) return;

      const match = state.matches.find((item) => item.id === button.dataset.delete);
      if (!match) return;

      const ok = window.confirm(
        `Usunąć mecz ${match.champion}${match.partner ? ` + ${match.partner}` : ""}?`,
      );
      if (!ok) return;

      try {
        if (state.user) {
          await apiRequest(`/api/matches/${encodeURIComponent(match.id)}`, {
            method: "DELETE",
          });
        }
        state.matches = state.matches.filter((item) => item.id !== match.id);
        if (!state.user) persistMatches();
        announce("Mecz usunięty.");
        render();
      } catch (error) {
        announce(error.message);
      }
    });
  });

  dom.exportButton.addEventListener("click", exportMatches);
  dom.importInput.addEventListener("change", importMatches);

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

  dom.riotSyncButton.addEventListener("click", syncRiotMatches);
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
  }
  dom.authPanels.forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.authPanel === tabName);
  });
}

function setChampionFilter(champion) {
  state.filters.champion = champion;
  updateChampionFilterButton();
  closeChampionPicker();
  render();
}

function updateChampionFilterButton() {
  const champion = state.filters.champion;
  dom.championFilterLabel.textContent = champion || "Wszyscy wygrani";
  const icon = renderChampionIcon(champion);
  icon.id = "championFilterIcon";
  dom.championFilterIcon.replaceWith(icon);
  dom.championFilterIcon = document.getElementById("championFilterIcon");
  dom.championPickerButton.classList.toggle("is-all-selected", !champion);
  dom.championPickerMenu.querySelectorAll("[data-champion]").forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.champion === champion));
  });
}

function closeChampionPicker() {
  dom.championPicker.classList.remove("is-open");
  dom.championPickerButton.setAttribute("aria-expanded", "false");
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
  // Dashboard no longer has global filters; collection filtering is handled by setChampionFilter.
}

function render() {
  const matches = getSortedMatches();
  renderVictoryProgress(matches);
  renderMetrics(matches);
  renderWonChampionStrip(matches);
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

  dom.riotSyncButton.disabled = !state.user;

  const hasKey = Boolean(state.riotStatus?.riotApiKey);
  dom.riotKeyStatus.textContent = hasKey ? "RIOT_API_KEY OK" : "Brak RIOT_API_KEY";
  dom.riotKeyStatus.classList.toggle("is-ready", hasKey);
  dom.riotKeyStatus.classList.toggle("is-missing", !hasKey);

  if (!state.user) {
    dom.accountTitle.textContent ||= "Zaloguj";
    dom.profileName.textContent = "Konto";
    dom.profileEmail.textContent = "";
    dom.riotSyncStatus.replaceChildren(
      el("strong", "", "Po zalogowaniu zapiszesz Riot ID."),
      el("span", "", state.backendAvailable ? "API jest gotowe." : "Uruchom node server.js."),
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
      el("strong", "", "Riot ID nie jest jeszcze zapisane."),
      el("span", "", hasKey ? "Możesz zweryfikować konto i importować mecze Areny." : "Ustaw RIOT_API_KEY przed importem."),
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
  const bestChampion = findBestChampion(getSortedMatches());
  return (
    CHAMPION_ICONS[bestChampion?.champion] ||
    CHAMPION_ICONS.Vi ||
    CHAMPION_ICONS.Lux ||
    Object.values(CHAMPION_ICONS)[0] ||
    ""
  );
}

function getSortedMatches() {
  return [...state.matches]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderMetrics(matches) {
  const games = matches.length;
  const wins = matches.filter((match) => match.placement === 1).length;
  const wonChampions = getWonChampionStats(matches);
  const remaining = Math.max(0, CHAMPIONS.length - wonChampions.length);

  const cards = [
    {
      label: "Mecze",
      value: games,
      note: state.user ? "z konta ArenaTracker" : "lokalnie lub demo",
    },
    {
      label: "Wygrane",
      value: wins,
      note: wins === 1 ? "1 pierwsze miejsce" : `${wins} pierwszych miejsc`,
    },
    {
      label: "Kolekcja winów",
      value: wonChampions.length,
      note: `${remaining} bez wygranej`,
    },
  ];

  dom.metricsGrid.replaceChildren(...cards.map(renderMetricCard));
}

function renderMetricCard(card) {
  const root = el("article", "metric-card");
  root.append(el("div", "metric-label", card.label));
  root.append(el("div", "metric-value", card.value));
  root.append(el("div", "metric-note", card.note));
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

function renderChampionCollection(matches) {
  const won = getWonChampionStats(matches);
  renderChampionPicker(won);
  const collection = state.filters.champion
    ? won.filter((stat) => stat.champion === state.filters.champion)
    : won;

  dom.collectionStatus.textContent = `${won.length} / ${CHAMPIONS.length} z wygraną`;
  if (!collection.length) {
    const empty = emptyState();
    empty.querySelector("strong").textContent = won.length
      ? "Ten champion nie ma jeszcze wygranej."
      : "Nie masz jeszcze zapisanych wygranych.";
    empty.querySelector("span").textContent = "Wczytaj demo albo zsynchronizuj konto.";
    dom.championCollection.replaceChildren(empty);
    return;
  }
  dom.championCollection.replaceChildren(...collection.map(renderChampionCollectionCard));
}

function renderChampionPill(stat) {
  const root = el("article", "champion-pill");
  const body = el("div", "champion-card-copy");
  body.append(el("strong", "", stat.champion));
  body.append(el("span", "", `${stat.wins} win${stat.bestPartner ? ` · ${stat.bestPartner}` : ""}`));
  root.append(renderChampionIcon(stat.champion), body);
  return root;
}

function renderChampionCollectionCard(stat) {
  const root = el("article", "champion-collection-card is-complete");
  const body = el("div", "champion-card-copy");
  body.append(el("strong", "", stat.champion));
  body.append(
    el("span", "", `${stat.wins} win${stat.bestPartner ? ` · duet: ${stat.bestPartner}` : ""}`),
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
  const title = el("strong", "", `${match.champion}${match.partner ? ` + ${match.partner}` : ""}`);
  const placement = el(
    "span",
    `placement-badge ${match.placement <= 2 ? "top" : match.placement >= 6 ? "low" : ""}`,
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

  const actions = el("div", "match-actions");
  const deleteButton = el("button", "danger-button", "Usuń");
  deleteButton.type = "button";
  deleteButton.dataset.delete = match.id;
  actions.append(deleteButton);
  root.append(actions);

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
    announce("Uruchom node server.js, żeby użyć logowania.");
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

    announce(message);
    render();
  } catch (error) {
    announce(error.message);
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
    announce("Link resetujący został wygenerowany.");
  } catch (error) {
    announce(error.message);
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
    return;
  }

  const link = document.createElement("a");
  link.href = data.resetUrl;
  link.textContent = "Otwórz lokalny link resetujący";
  link.className = "inline-link";
  dom.accountStatus.replaceChildren(title, note, link);
  dom.accountStatus.classList.remove("is-hidden");
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
    announce("Najpierw zaloguj się do ArenaTracker.");
    return;
  }

  const body = Object.fromEntries(new FormData(dom.riotProfileForm).entries());
  try {
    const data = await apiRequest("/api/riot/profile", { method: "POST", body });
    state.user = data.user;
    fillRiotProfileForm();
    announce("Riot ID zapisane.");
    render();
  } catch (error) {
    announce(error.message);
  }
}

async function syncRiotMatches() {
  if (!state.user) {
    announce("Najpierw zaloguj się do ArenaTracker.");
    return;
  }

  dom.riotSyncButton.disabled = true;
  dom.riotSyncStatus.replaceChildren(
    el("strong", "", "Synchronizacja trwa."),
    el("span", "", "Pobieram najnowsze mecze Arena z Riot Match-V5."),
  );

  try {
    const data = await apiRequest("/api/riot/sync", {
      method: "POST",
      body: { limit: 30 },
    });
    state.user = data.user;
    state.matches = data.matches.map(normalizeMatch).filter(Boolean);
    fillRiotProfileForm();
    announce(`Zaimportowano ${data.importedCount} nowych meczów.`);
    render();
  } catch (error) {
    announce(error.message);
    render();
  } finally {
    dom.riotSyncButton.disabled = false;
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

  return {
    id: match.id || makeId(),
    date: cleanText(match.date),
    patch: cleanText(match.patch || DATA_DRAGON_VERSION),
    champion: cleanText(match.champion),
    partner: cleanText(match.partner),
    placement: clamp(Number(match.placement), 1, 8),
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
    if (match.placement === 1) increment(stat.partners, match.partner || "Solo/unknown");
  });

  return [...grouped.values()].map((stat) => ({
    ...stat,
    avg: average(stat.placements),
    bestPartner: mapLeader(stat.partners),
  }));
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
