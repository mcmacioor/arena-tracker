const APP_VERSION = "0.5.1";
const GAME_DATA = globalThis.ARENA_GAME_DATA || {};
const DATA_DRAGON_VERSION = GAME_DATA.version || "16.13.1";
const STORAGE_KEY = "arenatracker.matches.v1";
const LANGUAGE_STORAGE_KEY = "arenatracker.language.v1";
const FRIENDS_STORAGE_KEY = "arenatracker.friends.v1";
const CHAMPION_ICONS = GAME_DATA.championIcons || {};
const CHAMPION_KEYS = GAME_DATA.championKeys || {};
const CHAMPION_ALIASES = GAME_DATA.championAliases || {};
const ITEM_DETAILS = GAME_DATA.itemDetails || {};
const AUGMENT_DETAILS = GAME_DATA.augmentDetails || {};
const DEFAULT_AUTH_AVATAR = CHAMPION_ICONS.Malphite || "";
const ARENA_MAX_PLACEMENT = 6;
const RIOT_SEASON_SYNC_LIMIT = 500;
const RIOT_SEASON_SYNC_TIMEOUT_MS = 480000;

const translations = {
  pl: {
    "actions.sync": "Synchronizuj",
    "actions.refresh": "Odśwież",
    "actions.add": "Dodaj",
    "actions.coffee": "Postaw kawę",
    "landing.title": "Znajdź profil",
    "landing.subtitle": "Śledź wygranych championów, historię Areny i postęp w wyzwaniu.",
    "leaderboard.title": "Leaderboard",
    "leaderboard.profiles": "Ranking profili",
    "settings.language": "Język",
    "nav.history": "Historia",
    "nav.wins": "Championi",
    "tabs.summary": "Podsumowanie",
    "tabs.history": "Historia",
    "tabs.wins": "Championi",
    "tabs.group": "Moja grupa",
    "tabs.live": "Live game",
    "progress.label": "Postęp",
    "progress.title": "Wygrani championi",
    "history.title": "Historia",
    "friends.title": "Moja grupa",
    "friends.loginRequired": "Zaloguj się, żeby utworzyć grupę.",
    "friends.privateCaption": "Ranking znajomych jest prywatny dla konta.",
    "matchDetails.title": "Szczegóły meczu",
    "actions.showMore": "Pokaż więcej",
    "actions.backToHistory": "Wróć do historii",
    "common.games": "Gry",
    "common.wins": "Wygrane",
    "common.win": "win",
    "common.patch": "Patch",
    "common.date": "Data",
    "common.place": "Miejsce",
    "common.players": "Gracze",
    "common.augments": "Augmenty",
    "common.items": "Itemy",
    "common.team": "Drużyna",
    "common.ad": "Reklama",
    "common.noData": "Brak danych dla tych filtrów.",
    "common.status": "Status",
    "common.unknownPlayer": "Nieznany gracz",
    "common.championsWon": "z wygraną",
    "common.lastSync": "Ostatni sync",
    "common.playerProfile": "profil gracza",
    "search.resultsTitle": "Profile graczy",
    "search.searching": "Szukam...",
    "common.average": "średnio",
    "common.gamesLower": "gier",
    "common.playersLower": "graczy",
    "common.noAugments": "Brak augmentów",
    "common.noItems": "Brak itemów",
    "dashboard.wonChampions": "Championi z wygraną",
    "dashboard.recentMatches": "Ostatnie mecze",
    "dashboard.topDuo": "Najlepsze duo",
    "dashboard.noPartners": "Brak danych o partnerach.",
    "dashboard.noPartnersCaption": "Synchronizacja uzupełni graczy z Twojej drużyny.",
    "history.partners": "Partnerzy z Areny",
    "champions.title": "Championi",
    "champions.search": "Szukaj championa",
    "champions.won": "Wygrani",
    "champions.missing": "Brakujący",
    "champions.all": "Wszyscy",
    "champions.sort": "Sortowanie",
    "champions.completed": "Ukończono",
    "champions.bestPlace": "Najlepsze miejsce",
    "champions.noGames": "Brak gier",
    "champions.noFiltered": "Brak championów dla tych filtrów.",
    "champions.noFilteredCaption": "Zmień filtr albo zsynchronizuj konto.",
    "champions.noSavedGames": "Brak zapisanych gier tym championem.",
    "champions.avgPlace": "Średnie miejsce",
    "sort.wins": "Liczba winów",
    "sort.az": "A-Z",
    "sort.games": "Liczba gier",
    "sort.best": "Najlepsze miejsce",
    "sort.avg": "Średnie miejsce",
    "sort.missing": "Najbliżej wygranej",
    "public.notFound": "Nie znaleziono profilu",
    "public.profile": "Publiczny profil",
    "live.eyebrow": "Aktualna gra Arena",
    "live.title": "Live game",
    "live.checking": "Sprawdzam aktualną grę...",
    "live.notPlaying": "Ten gracz nie gra teraz Areny.",
    "live.noProfile": "Najpierw wybierz profil gracza.",
    "live.error": "Nie udało się sprawdzić live game.",
    "live.active": "Arena trwa teraz.",
    "live.team": "Drużyna",
    "live.level": "Poziom",
    "live.soloq": "SoloQ",
    "live.unranked": "Unranked",
    "account.label": "Konto",
    "account.login": "Zaloguj",
    "account.savedLeague": "Konto League zapisane.",
    "account.saveLeague": "Zapisz konto League",
    "account.noLeague": "Konto League nie jest jeszcze zapisane.",
    "account.noLeagueCaption": "Po zapisaniu synchronizacja Areny uruchomi się automatycznie.",
    "account.syncingCaption": "Możesz zamknąć panel. Konto League jest już zapisane.",
    "account.syncFailed": "Synchronizacja nie powiodła się.",
    "account.localProfile": "Profil zapisany lokalnie.",
    "account.verified": "Zweryfikowano",
    "account.loginRequired": "Najpierw zaloguj się do ArenaTracker.",
    "account.syncAlreadyRunning": "Synchronizacja już trwa.",
    "account.completeRiotId": "Uzupełnij nazwę w grze i tag Riot ID.",
    "account.saving": "Zapisuję...",
    "public.loading": "Ładuję profil.",
    "public.wait": "Chwila.",
    "public.checkLink": "Sprawdź region i nazwę w linku.",
    "public.noResults": "Brak wyników.",
    "public.changeSearch": "Zmień tekst w wyszukiwarce championów.",
    "public.noWonChampions": "Brak wygranych championów.",
    "public.noWonCaption": "Publiczny profil uzupełni się po synchronizacji.",
    "public.noHistory": "Brak historii meczów.",
    "public.noHistoryCaption": "Synchronizacja uzupełni ostatnie gry.",
    "public.noDuo": "Brak danych duo.",
    "public.noDuoCaption": "Synchronizacja uzupełni partnerów.",
    "match.notFound": "Nie znaleziono meczu.",
    "match.notFoundCaption": "Wróć do historii i wybierz pozycję jeszcze raz.",
    "match.noFullPlayers": "Brak pełnej listy graczy.",
    "match.noFullPlayersCaption": "Kolejna synchronizacja uzupełni nowszy format meczu.",
  },
  en: {
    "actions.sync": "Sync",
    "actions.refresh": "Refresh",
    "actions.add": "Add",
    "actions.coffee": "Buy coffee",
    "landing.title": "Find an Arena profile",
    "landing.subtitle": "Track champion wins, Arena history, and your progress toward the full collection.",
    "leaderboard.title": "Leaderboard",
    "leaderboard.profiles": "Profile ranking",
    "settings.language": "Language",
    "nav.history": "History",
    "nav.wins": "Champions",
    "tabs.summary": "Summary",
    "tabs.history": "History",
    "tabs.wins": "Champions",
    "tabs.group": "My group",
    "tabs.live": "Live game",
    "progress.label": "Progress",
    "progress.title": "Champion wins",
    "history.title": "History",
    "friends.title": "My group",
    "friends.loginRequired": "Log in to create a group.",
    "friends.privateCaption": "Friend rankings are private to your account.",
    "matchDetails.title": "Match details",
    "actions.showMore": "Show more",
    "actions.backToHistory": "Back to history",
    "common.games": "Games",
    "common.wins": "Wins",
    "common.win": "win",
    "common.patch": "Patch",
    "common.date": "Date",
    "common.place": "Place",
    "common.players": "Players",
    "common.augments": "Augments",
    "common.items": "Items",
    "common.team": "Team",
    "common.ad": "Ad",
    "common.noData": "No data for these filters.",
    "common.status": "Status",
    "common.unknownPlayer": "Unknown player",
    "common.championsWon": "champions won",
    "common.lastSync": "Last sync",
    "common.playerProfile": "player profile",
    "search.resultsTitle": "Summoner Profiles",
    "search.searching": "Searching...",
    "common.average": "average",
    "common.gamesLower": "games",
    "common.playersLower": "players",
    "common.noAugments": "No augments",
    "common.noItems": "No items",
    "dashboard.wonChampions": "Champions with a win",
    "dashboard.recentMatches": "Recent matches",
    "dashboard.topDuo": "Top duo",
    "dashboard.noPartners": "No partner data.",
    "dashboard.noPartnersCaption": "Sync will fill your Arena teammates.",
    "history.partners": "Arena partners",
    "champions.title": "Champions",
    "champions.search": "Search champion",
    "champions.won": "Won",
    "champions.missing": "Missing",
    "champions.all": "All",
    "champions.sort": "Sort",
    "champions.completed": "Completed",
    "champions.bestPlace": "Best place",
    "champions.noGames": "No games",
    "champions.noFiltered": "No champions for these filters.",
    "champions.noFilteredCaption": "Change filter or sync the account.",
    "champions.noSavedGames": "No saved games with this champion.",
    "champions.avgPlace": "Average place",
    "sort.wins": "Win count",
    "sort.az": "A-Z",
    "sort.games": "Game count",
    "sort.best": "Best place",
    "sort.avg": "Average place",
    "sort.missing": "Closest to win",
    "public.notFound": "Profile not found",
    "public.profile": "Public profile",
    "live.eyebrow": "Current Arena match",
    "live.title": "Live game",
    "live.checking": "Checking current game...",
    "live.notPlaying": "This player is not in an Arena game right now.",
    "live.noProfile": "Choose a player profile first.",
    "live.error": "Could not check live game.",
    "live.active": "Arena is live now.",
    "live.team": "Team",
    "live.level": "Level",
    "live.soloq": "SoloQ",
    "live.unranked": "Unranked",
    "account.label": "Account",
    "account.login": "Sign in",
    "account.savedLeague": "League account saved.",
    "account.saveLeague": "Save League account",
    "account.noLeague": "League account is not saved yet.",
    "account.noLeagueCaption": "Arena sync starts automatically after saving.",
    "account.syncingCaption": "You can close this panel. League account is already saved.",
    "account.syncFailed": "Sync failed.",
    "account.localProfile": "Profile saved locally.",
    "account.verified": "Verified",
    "account.loginRequired": "Sign in to ArenaTracker first.",
    "account.syncAlreadyRunning": "Sync is already running.",
    "account.completeRiotId": "Enter game name and Riot ID tag.",
    "account.saving": "Saving...",
    "public.loading": "Loading profile.",
    "public.wait": "One moment.",
    "public.checkLink": "Check the region and profile name in the link.",
    "public.noResults": "No results.",
    "public.changeSearch": "Change the champion search text.",
    "public.noWonChampions": "No champion wins yet.",
    "public.noWonCaption": "Public profile will fill after sync.",
    "public.noHistory": "No match history.",
    "public.noHistoryCaption": "Sync will fill recent games.",
    "public.noDuo": "No duo data.",
    "public.noDuoCaption": "Sync will fill Arena partners.",
    "match.notFound": "Match not found.",
    "match.notFoundCaption": "Go back to history and choose it again.",
    "match.noFullPlayers": "No full player list.",
    "match.noFullPlayersCaption": "Next sync will fill the newer match format.",
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
  publicChampionSearch: "",
  language: localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en",
  backendAvailable: false,
  riotStatus: null,
  resetToken: "",
  isAutoSyncing: false,
  syncError: "",
  visibleMatchCount: 8,
  friends: loadFriends(),
  friendProfiles: new Map(),
  leaderboard: {
    loading: false,
    error: "",
    rows: [],
    updatedAt: "",
    region: "euw1",
  },
  liveGame: {
    loading: false,
    error: "",
    data: null,
    profileKey: "",
  },
  searchTimers: new WeakMap(),
  filters: {
    championSearch: "",
    collectionMode: "all",
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
    brandHomeButton: document.getElementById("brandHomeButton"),
    accountMenuButton: document.getElementById("accountMenuButton"),
    accountDropdown: document.getElementById("accountDropdown"),
    accountActionButtons: document.querySelectorAll("[data-account-action]"),
    accountAvatar: document.getElementById("accountAvatar"),
    accountMenuLabel: document.getElementById("accountMenuLabel"),
    landingSearch: document.getElementById("landingSearch"),
    playerSearchForms: document.querySelectorAll("[data-player-search-form]"),
    profileHeroAvatar: document.getElementById("profileHeroAvatar"),
    profileHeroName: document.getElementById("profileHeroName"),
    profileHeroMeta: document.getElementById("profileHeroMeta"),
    profileSyncButton: document.getElementById("profileSyncButton"),
    profileSyncNote: document.getElementById("profileSyncNote"),
    languageSelect: document.getElementById("languageSelect"),
    languageFlag: document.getElementById("languageFlag"),
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
    championDetailBuild: document.getElementById("championDetailBuild"),
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
    publicProfileMeta: document.getElementById("publicProfileMeta"),
    publicSyncButton: document.getElementById("publicSyncButton"),
    publicSyncStatus: document.getElementById("publicSyncStatus"),
    publicChampionSearch: document.getElementById("publicChampionSearch"),
    publicProgressCounter: document.getElementById("publicProgressCounter"),
    publicVictoryProgress: document.getElementById("publicVictoryProgress"),
    publicWonChampions: document.getElementById("publicWonChampions"),
    publicMissingChampions: document.getElementById("publicMissingChampions"),
    publicMatchHistory: document.getElementById("publicMatchHistory"),
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
    leaderboardRegionLabel: document.getElementById("leaderboardRegionLabel"),
    leaderboardPodium: document.getElementById("leaderboardPodium"),
    leaderboardRows: document.getElementById("leaderboardRows"),
    leaderboardRefreshButton: document.getElementById("leaderboardRefreshButton"),
    liveGameTitle: document.getElementById("liveGameTitle"),
    liveGameStatus: document.getElementById("liveGameStatus"),
    liveGameTeams: document.getElementById("liveGameTeams"),
    liveGameRefreshButton: document.getElementById("liveGameRefreshButton"),
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
  } catch {
    state.backendAvailable = false;
    state.user = null;
  }

  fillRiotProfileForm();
  render();
  if (state.activeRoute === "leaderboard" && state.backendAvailable) {
    void loadLeaderboard({ force: true });
  }
}

function bindEvents() {
  window.addEventListener("hashchange", updateRoute);
  dom.languageSelect.value = state.language;
  applyLanguage();

  dom.brandHomeButton?.addEventListener("click", handleBrandHomeClick);

  document.querySelectorAll(".nav-link, .top-nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      closeAccountOverlay();
      setActiveRoute(link.dataset.route);
    });
  });

  dom.accountMenuButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!state.user) {
      openAccountOverlay("login");
      return;
    }
    toggleAccountDropdown();
  });

  dom.accountActionButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      closeAccountDropdown();
      if (button.dataset.accountAction === "profile") {
        goToOwnProfile();
        return;
      }
      if (button.dataset.accountAction === "settings") {
        openAccountOverlay("profile");
        return;
      }
      if (button.dataset.accountAction === "logout") {
        await logout();
      }
    });
  });

  dom.accountOverlayBackdrop?.addEventListener("click", closeAccountOverlay);
  dom.accountOverlayClose?.addEventListener("click", closeAccountOverlay);

  dom.profileSyncButton.addEventListener("click", async () => {
    if (state.publicRoute && !isViewingOwnProfile()) {
      await loadPublicProfile(state.publicRoute, { force: true });
      await checkLiveGameForCurrentProfile({ navigateIfActive: true });
      return;
    }
    await syncRiotMatches({ automatic: false, deep: true });
  });

  dom.publicSyncButton?.addEventListener("click", async () => {
    if (!state.publicRoute) return;
    await loadPublicProfile(state.publicRoute, { force: true });
    await checkLiveGameForCurrentProfile({ navigateIfActive: true });
  });

  dom.leaderboardRefreshButton?.addEventListener("click", () => loadLeaderboard({ force: true }));
  dom.liveGameRefreshButton?.addEventListener("click", () => checkLiveGameForCurrentProfile({ navigateIfActive: false, force: true }));

  dom.playerSearchForms.forEach((form) => {
    updateSearchPlaceholder(form);
    form.addEventListener("submit", handlePlayerSearchSubmit);
    form.addEventListener("input", handlePlayerSearchInput);
    form.addEventListener("change", handlePlayerSearchChange);
    form.addEventListener("focusin", handlePlayerSearchFocus);
    form.addEventListener("click", handlePlayerSearchClick);
  });

  dom.languageSelect.addEventListener("change", () => {
    state.language = dom.languageSelect.value === "en" ? "en" : "pl";
    localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language);
    applyLanguage();
    render();
  });

  dom.publicChampionSearch?.addEventListener("input", () => {
    state.publicChampionSearch = dom.publicChampionSearch.value;
    renderPublicProfile();
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
      closeAccountDropdown();
      closeChampionDetail();
      closeMatchDetail();
      closeAllSearchResults();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#accountMenu")) closeAccountDropdown();
    if (event.target.closest("[data-player-search-form]")) return;
    closeAllSearchResults();
  });

  dom.leaderboardRows?.addEventListener("click", (event) => {
    const row = event.target.closest("[data-public-path]");
    if (!row) return;
    window.history.pushState(null, "", row.dataset.publicPath);
    updateRoute();
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
    if (event.target.closest(".asset-tag")) return;
    const player = event.target.closest("[data-player-profile]");
    if (!player) return;
    openPlayerProfile(player.dataset.playerProfile, player.dataset.playerRegion);
  });

  dom.liveGameTeams?.addEventListener("click", (event) => {
    const player = event.target.closest("[data-player-profile]");
    if (!player) return;
    openPlayerProfile(player.dataset.playerProfile, player.dataset.playerRegion);
  });

  dom.friendRanking.addEventListener("click", (event) => {
    const friend = event.target.closest("[data-friend-profile]");
    if (!friend) return;
    openPlayerProfile(friend.dataset.friendProfile, friend.dataset.friendRegion);
  });

  dom.authSwitches?.forEach((switchButton) => {
    switchButton.addEventListener("click", () => setAuthTab(switchButton.dataset.authSwitch));
  });

  dom.loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitAuthForm(dom.loginForm, "/api/auth/login", "Zalogowano.");
  });

  dom.registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitAuthForm(dom.registerForm, "/api/auth/register", "Utworzono konto.");
  });

  dom.resetPasswordForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await requestPasswordReset();
  });

  dom.confirmResetForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await confirmPasswordReset();
  });

  dom.riotProfileForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveRiotProfile();
  });
}

function handleBrandHomeClick() {
  window.history.pushState(null, "", "/");
  state.publicRoute = null;
  state.publicProfile = null;
  state.activeMatchId = "";
  updateRoute();
  requestAnimationFrame(() => {
    document.querySelector(".landing-player-search input[name='riotId']")?.focus();
  });
}

function goToOwnProfile() {
  const profile = state.user?.riotProfile;
  if (!profile?.gameName || !profile?.tagLine) {
    window.history.pushState(null, "", "/#dashboard");
    updateRoute();
    return;
  }

  const path = `/${publicRegionSlug(profile.region)}/${encodeURIComponent(`${profile.gameName}-${profile.tagLine}`)}#dashboard`;
  window.history.pushState(null, "", path);
  updateRoute();
}

function toggleAccountDropdown() {
  if (!dom.accountMenu || !dom.accountMenuButton) return;
  const isOpen = dom.accountMenu.classList.toggle("is-open");
  dom.accountDropdown?.setAttribute("aria-hidden", String(!isOpen));
  dom.accountMenuButton.setAttribute("aria-expanded", String(isOpen));
}

function closeAccountDropdown() {
  if (!dom.accountMenu) return;
  dom.accountMenu.classList.remove("is-open");
  dom.accountDropdown?.setAttribute("aria-hidden", "true");
  if (!dom.accountOverlay?.classList.contains("is-open")) {
    dom.accountMenuButton.setAttribute("aria-expanded", "false");
  }
}

function setActiveRoute(route) {
  state.activeRoute = route;
  document.body.classList.toggle("is-public-route", Boolean(state.publicRoute));
  document.body.classList.toggle("is-guest-home", !state.user && route === "dashboard" && !state.publicRoute);
  document.body.classList.toggle("is-leaderboard-route", route === "leaderboard");
  document.querySelectorAll(".nav-link, .top-nav-link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.route === route);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-visible", view.dataset.view === route);
  });
}

function setAuthTab(tabName) {
  if (!dom.accountTitle) return;
  const titleByTab = {
    login: t("account.login"),
    register: state.language === "en" ? "Create account" : "Rejestracja",
    reset: state.language === "en" ? "Reset password" : "Reset hasła",
  };
  dom.accountTitle.textContent = titleByTab[tabName] || t("account.login");
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
  if (!dom.accountOverlay) return;
  closeAccountDropdown();
  if (!state.user) setAuthTab(tabName === "profile" ? "login" : tabName);
  dom.accountOverlay.classList.add("is-open");
  dom.accountOverlay.setAttribute("aria-hidden", "false");
  dom.accountMenuButton?.setAttribute("aria-expanded", "true");
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
    renderDetailStat(t("common.wins"), stat.wins),
    renderDetailStat(t("common.games"), stat.games),
    renderDetailStat(t("champions.avgPlace"), formatAveragePlacement(stat.avg)),
  );
  renderChampionBuild(champion, matches);
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
      : [el("article", "detail-history-row is-empty", t("champions.noSavedGames"))]),
  );
  dom.championDetailOverlay.classList.add("is-open");
  dom.championDetailOverlay.setAttribute("aria-hidden", "false");
}

function closeChampionDetail() {
  dom.championDetailOverlay.classList.remove("is-open");
  dom.championDetailOverlay.setAttribute("aria-hidden", "true");
}

function renderChampionBuild(champion) {
  if (!dom.championDetailBuild) return;
  const championName = canonicalChampionName(champion) || champion;
  const url = `https://www.metasrc.com/lol/arena/build/${metasrcChampionSlug(championName)}`;
  dom.championDetailBuild.classList.remove("is-hidden");
  const link = el(
    "a",
    "metasrc-build-link",
    state.language === "en" ? "Check build on MetaSRC" : "Sprawdź build na MetaSRC",
  );
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  dom.championDetailBuild.replaceChildren(link);
}

function metasrcChampionSlug(champion) {
  return normalizeLookupKey(champion)
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
  const match = getSortedMatches().find((item) => item.id === state.activeMatchId);
  if (!match) {
    dom.matchDetailPageTitle.textContent = state.language === "en" ? "Match" : "Mecz";
    dom.matchDetailPageStats.replaceChildren(renderDetailStat(t("common.status"), t("common.noData")));
    dom.matchDetailPagePlayers.replaceChildren(emptyState(t("match.notFound"), t("match.notFoundCaption")));
    dom.matchDetailPageAugments.replaceChildren();
    dom.matchDetailPageItems.replaceChildren();
    return;
  }

  dom.matchDetailPageTitle.textContent = formatDateTime(match.playedAt || match.date);
  dom.matchDetailPageStats.replaceChildren(
    renderDetailStat(t("common.date"), formatDateTime(match.playedAt || match.date)),
    renderDetailStat(t("common.patch"), match.patch),
    renderDetailStat(t("common.place"), `#${match.placement}`),
  );
  dom.matchDetailPagePlayers.replaceChildren(...renderMatchPlayers(match));
  renderAssetTags(dom.matchDetailPageAugments, match.augments, t("common.noAugments"));
  renderAssetTags(dom.matchDetailPageItems, match.items, t("common.noItems"));
}

function currentProfileForLive() {
  if (state.publicRoute && !isViewingOwnProfile()) {
    const profile = state.publicProfile?.data?.profile;
    if (profile?.gameName && profile?.tagLine) return profile;
    const parsed = parseRiotId(safeDecode(state.publicRoute.slug));
    if (parsed) {
      return {
        gameName: parsed.gameName,
        tagLine: parsed.tagLine,
        region: normalizeRegion(state.publicRoute.region),
      };
    }
    return null;
  }

  return state.user?.riotProfile || null;
}

function liveProfileKey(profile) {
  if (!profile?.gameName || !profile?.tagLine) return "";
  return `${normalizeRegion(profile.region)}:${normalizeLookupKey(profile.gameName)}:${normalizeLookupKey(profile.tagLine)}`;
}

async function checkLiveGameForCurrentProfile(options = {}) {
  const profile = currentProfileForLive();
  if (!profile?.gameName || !profile?.tagLine) {
    state.liveGame = {
      loading: false,
      error: t("live.noProfile"),
      data: null,
      profileKey: "",
    };
    renderLiveGame();
    return null;
  }

  const profileKey = liveProfileKey(profile);
  if (state.liveGame.loading && state.liveGame.profileKey === profileKey && !options.force) return state.liveGame.data;

  state.liveGame = {
    loading: true,
    error: "",
    data: state.liveGame.profileKey === profileKey ? state.liveGame.data : null,
    profileKey,
  };
  renderLiveGame();

  try {
    const params = new URLSearchParams({
      region: normalizeRegion(profile.region || state.publicRoute?.region || "euw1"),
      riotId: `${profile.gameName}#${profile.tagLine}`,
    });
    const data = await apiRequest(`/api/riot/live-game?${params.toString()}`, { timeoutMs: 45000 });
    state.liveGame = {
      loading: false,
      error: "",
      data,
      profileKey,
    };
    renderLiveGame();
    if (data?.active && options.navigateIfActive) {
      window.location.hash = "live";
    }
    return data;
  } catch (error) {
    state.liveGame = {
      loading: false,
      error: error.message || t("live.error"),
      data: null,
      profileKey,
    };
    renderLiveGame();
    return null;
  }
}

function renderLiveGame() {
  if (!dom.liveGameStatus || !dom.liveGameTeams) return;
  const live = state.liveGame;
  const profile = currentProfileForLive();
  if (dom.liveGameTitle) {
    dom.liveGameTitle.textContent = live.data?.active && live.data?.profile
      ? `${live.data.profile.gameName}#${live.data.profile.tagLine}`
      : t("live.title");
  }

  if (!profile && !live.data) {
    dom.liveGameStatus.replaceChildren(emptyState(t("live.noProfile"), ""));
    dom.liveGameTeams.replaceChildren();
    return;
  }

  if (live.loading) {
    dom.liveGameStatus.replaceChildren(renderLiveStatus(t("live.checking"), profile ? `${profile.gameName}#${profile.tagLine}` : ""));
    dom.liveGameTeams.replaceChildren();
    return;
  }

  if (live.error) {
    dom.liveGameStatus.replaceChildren(emptyState(live.error, t("live.error")));
    dom.liveGameTeams.replaceChildren();
    return;
  }

  const data = live.data;
  if (!data?.active) {
    dom.liveGameStatus.replaceChildren(renderLiveStatus(t("live.notPlaying"), profile ? `${profile.gameName}#${profile.tagLine}` : ""));
    dom.liveGameTeams.replaceChildren();
    return;
  }

  const queueLabel = data.queueId ? `Queue ${data.queueId}` : "Arena";
  dom.liveGameStatus.replaceChildren(renderLiveStatus(t("live.active"), queueLabel));
  dom.liveGameTeams.replaceChildren(...(data.teams || []).map((team, index) => renderLiveTeam(team, index, data.region)));
}

function renderLiveStatus(title, caption) {
  const root = el("article", "live-status-card");
  root.append(el("strong", "", title));
  if (caption) root.append(el("span", "", caption));
  return root;
}

function renderLiveTeam(team, index, region) {
  const root = el("article", "live-team-card");
  const placement = team.placement || index + 1;
  const head = el("div", "live-team-head");
  head.append(
    el("strong", "", `${t("live.team")} #${placement}`),
    el("span", "", `${team.players?.length || 0} ${t("common.playersLower")}`),
  );
  const grid = el("div", "live-player-grid");
  (team.players || []).forEach((player) => grid.append(renderLivePlayer(player, region)));
  root.append(head, grid);
  return root;
}

function renderLivePlayer(player, region) {
  const root = el("button", "live-player-card");
  root.type = "button";
  root.dataset.playerProfile = player.riotId || "";
  root.dataset.playerRegion = region || "euw1";
  root.disabled = !player.riotId;
  const avatar = player.profileIconUrl
    ? imageIcon(player.profileIconUrl, "live-player-avatar")
    : renderChampionIcon(player.champion);
  const copy = el("span", "live-player-copy");
  copy.append(
    el("strong", "", player.riotId || t("common.unknownPlayer")),
    el("span", "", player.champion || "Unknown"),
  );
  const facts = el("span", "live-player-facts");
  facts.append(
    el("em", "", `${t("live.level")} ${player.summonerLevel || "-"}`),
    el("em", "", player.soloRank || t("live.unranked")),
  );
  root.append(avatar, copy, facts);
  return root;
}

function renderMatchPlayers(match) {
  const players = getMatchPlayers(match);
  if (!players.length) return [emptyState(
    t("match.noFullPlayers"),
    t("match.noFullPlayersCaption"),
  )];
  const groups = groupPlayersByTeam(players);
  return groups.map((group, index) => {
    const root = el("article", "match-team-group");
    const header = el("div", "match-team-head");
    header.append(
      el("strong", "", `${t("common.team")} #${group.placement}`),
      el("span", "", `${group.players.length} ${t("common.playersLower")}`),
    );
    const list = el("div", "match-team-players");
    group.players.forEach((player) => list.append(renderPlayerCard(player)));
    root.append(header, list);
    return root;
  });
}

function groupPlayersByTeam(players) {
  const grouped = new Map();
  players.forEach((player) => {
    const key = player.teamId || `placement-${player.placement || ARENA_MAX_PLACEMENT}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(player);
  });
  return [...grouped.values()]
    .map((teamPlayers) => ({
      placement: Math.min(...teamPlayers.map((player) => Number(player.placement || ARENA_MAX_PLACEMENT))),
      players: teamPlayers.sort((a, b) => (a.champion || "").localeCompare(b.champion || "")),
    }))
    .sort((a, b) => a.placement - b.placement);
}

function renderPlayerCard(player) {
  const root = el("button", "player-detail-card");
  root.type = "button";
  root.dataset.playerProfile = player.riotId || "";
  root.dataset.playerRegion = state.publicRoute?.region || state.user?.riotProfile?.region || "euw1";
  root.disabled = !player.riotId;
  const playerCopy = el("span", "player-card-copy");
  playerCopy.append(
    el("strong", "", player.riotId || t("common.unknownPlayer")),
    el("span", "", player.champion || "Unknown"),
  );
  const assets = el("div", "player-card-assets");
  const augmentGroup = renderAssetGroup(t("common.augments"), player.augments || [], 6);
  const itemGroup = renderAssetGroup(t("common.items"), player.items || [], 7);
  if (augmentGroup) assets.append(augmentGroup);
  if (itemGroup) assets.append(itemGroup);
  root.append(
    renderChampionIcon(player.champion),
    playerCopy,
    el("em", "", `#${player.placement || "-"}`),
  );
  if (assets.childElementCount) root.append(assets);
  return root;
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
  if (!dom.accountOverlay) return;
  dom.accountOverlay.classList.remove("is-open");
  dom.accountOverlay.setAttribute("aria-hidden", "true");
  closeAccountDropdown();
  dom.accountMenuButton?.setAttribute("aria-expanded", "false");
  if (window.location.hash.startsWith("#account")) {
    window.history.replaceState(null, "", `#${state.activeRoute || "dashboard"}`);
  }
}

function handlePlayerSearchSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const selected = form._selectedResult || form._searchResults?.[0];
  if (selected) {
    activateSearchResult(form, selected);
    return;
  }

  const parsed = parseRiotId(formData.get("riotId"));
  if (!parsed) {
    announce("Podaj Riot ID w formacie Nazwa#Tag.");
    return;
  }

  if (form.dataset.searchAction === "friend") {
    addFriendProfile(parsed, formData.get("region"));
    form.reset();
    hideSearchResults(form);
    return;
  }

  openPlayerProfile(`${parsed.gameName}#${parsed.tagLine}`, formData.get("region"));
}

function handlePlayerSearchInput(event) {
  const form = event.currentTarget;
  if (!["INPUT", "SELECT"].includes(event.target.tagName)) return;
  form._selectedResult = null;
  updateSearchPlaceholder(form);
  window.clearTimeout(state.searchTimers.get(form));
  state.searchTimers.set(form, window.setTimeout(() => updateSearchResults(form), 80));
}

function handlePlayerSearchChange(event) {
  const form = event.currentTarget;
  if (!event.target.matches('select[name="region"]')) return;
  updateSearchPlaceholder(form);
  if (form.classList.contains("top-player-search") && state.activeRoute === "leaderboard") {
    void loadLeaderboard({ force: true });
  }
}

function handlePlayerSearchFocus(event) {
  const form = event.currentTarget;
  if (!event.target.matches('input[name="riotId"]')) return;
  if (cleanText(event.target.value).length) updateSearchResults(form);
}

function handlePlayerSearchClick(event) {
  const button = event.target.closest("[data-search-result]");
  if (!button) return;
  event.preventDefault();
  const form = event.currentTarget;
  const result = form._searchResults?.[Number(button.dataset.searchResult)];
  if (!result) return;
  selectSearchResult(form, result);
  if (form.dataset.searchAction !== "friend") activateSearchResult(form, result);
}

async function updateSearchResults(form) {
  const formData = new FormData(form);
  const query = cleanText(formData.get("riotId"));
  const region = normalizeRegion(formData.get("region"));
  if (query.length < 1) {
    form._searchRequestId = (form._searchRequestId || 0) + 1;
    hideSearchResults(form);
    return;
  }

  const resultsBox = form.querySelector("[data-search-results]");
  resultsBox.classList.add("is-open");
  resultsBox.replaceChildren(el("div", "search-results-status", t("search.searching")));
  const requestId = (form._searchRequestId || 0) + 1;
  form._searchRequestId = requestId;

  try {
    const params = new URLSearchParams({ q: query, region });
    const data = await apiRequest(`/api/riot/search?${params.toString()}`, { timeoutMs: 8000 });
    if (form._searchRequestId !== requestId) return;
    form._searchResults = data.results || [];
    renderSearchResults(form, form._searchResults, query);
  } catch (error) {
    if (form._searchRequestId !== requestId) return;
    form._searchResults = [];
    resultsBox.replaceChildren(el("div", "search-results-status", error.message));
  }
}

function renderSearchResults(form, results, query) {
  const resultsBox = form.querySelector("[data-search-results]");
  if (!results.length) {
    hideSearchResults(form);
    return;
  }

  resultsBox.classList.add("is-open");
  const title = el("div", "search-results-title", t("search.resultsTitle"));
  const rows = results.map((result, index) => {
    const row = el("button", "search-result-row");
    row.type = "button";
    row.dataset.searchResult = String(index);
    row.append(
      result.profileIconUrl ? imageIcon(result.profileIconUrl, "champion-icon") : el("span", "champion-icon is-empty", result.gameName.slice(0, 2)),
      el("strong", "", `${result.gameName} #${result.tagLine}`),
      el("span", "", `${regionLabel(result.region)} · ${result.caption || t("common.playerProfile")}`),
    );
    return row;
  });
  resultsBox.replaceChildren(title, ...rows);
}

function updateSearchPlaceholder(form) {
  const input = form.querySelector('input[name="riotId"]');
  const region = normalizeRegion(form.querySelector('select[name="region"]')?.value);
  if (!input) return;
  input.placeholder = state.language === "en"
    ? `Game name + #${regionLabel(region)}`
    : `Nazwa gry + #${regionLabel(region)}`;
}

function getLeaderboardRegion() {
  const regionSelect = document.querySelector('.top-player-search select[name="region"]');
  return normalizeRegion(regionSelect?.value || state.leaderboard.region || "euw1");
}

function selectSearchResult(form, result) {
  const input = form.querySelector('input[name="riotId"]');
  const regionSelect = form.querySelector('select[name="region"]');
  input.value = `${result.gameName}#${result.tagLine}`;
  regionSelect.value = normalizeRegion(result.region);
  form._selectedResult = result;
  updateSearchPlaceholder(form);
  hideSearchResults(form);
}

function activateSearchResult(form, result) {
  if (form.dataset.searchAction === "friend") {
    addFriendProfile({ gameName: result.gameName, tagLine: result.tagLine }, result.region);
    form.querySelector('input[name="riotId"]').value = "";
    form._selectedResult = null;
    return;
  }

  openPlayerProfile(`${result.gameName}#${result.tagLine}`, result.region);
}

function hideSearchResults(form) {
  const resultsBox = form.querySelector("[data-search-results]");
  form._searchResults = [];
  resultsBox?.classList.remove("is-open");
  resultsBox?.replaceChildren();
}

function closeAllSearchResults() {
  dom.playerSearchForms.forEach(hideSearchResults);
}

function addFriendProfile(parsed, regionValue) {
  const region = normalizeRegion(regionValue);
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
  const separatorIndex = text.includes("#") ? text.indexOf("#") : text.lastIndexOf("-");
  if (separatorIndex <= 0 || separatorIndex >= text.length - 1) return null;
  const gameName = text.slice(0, separatorIndex);
  const tagLine = text.slice(separatorIndex + 1);
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
  if (isLeaderboardPath()) {
    closeAccountOverlay();
    state.publicRoute = null;
    state.activeMatchId = "";
    setActiveRoute("leaderboard");
    renderResetTokenView();
    void loadLeaderboard();
    return;
  }

  const publicRoute = parsePublicRoute();
  if (publicRoute) {
    closeAccountOverlay();
    state.publicRoute = publicRoute;
    const rawRoute = window.location.hash.replace("#", "") || "dashboard";
    const [route, token] = rawRoute.split("/");
    const requestedRoute = route === "match" ? "match-detail" : route === "live" ? "live-game" : route;
    const knownRoute = document.querySelector(`[data-view="${requestedRoute}"]`)
      && !["friends", "public-profile"].includes(requestedRoute)
      ? requestedRoute
      : "dashboard";
    state.activeMatchId = route === "match" ? decodeURIComponent(token || "") : "";
    setActiveRoute(knownRoute);
    if (knownRoute === "live-game") {
      void checkLiveGameForCurrentProfile({ navigateIfActive: false })
        .finally(() => loadPublicProfile(publicRoute));
    } else {
      loadPublicProfile(publicRoute);
    }
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
    window.history.replaceState(null, "", "/");
    state.publicRoute = null;
    state.activeMatchId = "";
    setActiveRoute("dashboard");
    renderResetTokenView();
    return;
  }
  closeAccountOverlay();
  state.activeMatchId = "";
  const requestedRoute = route === "live" ? "live-game" : route;
  const knownRoute = document.querySelector(`[data-view="${requestedRoute}"]`) && requestedRoute !== "friends" ? requestedRoute : "dashboard";
  setActiveRoute(knownRoute);
  if (knownRoute === "live-game") {
    void checkLiveGameForCurrentProfile({ navigateIfActive: false });
  }
  renderResetTokenView();
}

function parsePublicRoute() {
  const segments = window.location.pathname.split("/").filter(Boolean);
  if (segments[0] === "leaderboard") return null;
  if (segments.length < 2 || segments[0].includes(".")) return null;
  return {
    region: segments[0],
    slug: safeDecode(segments.slice(1).join("/")),
  };
}

function isLeaderboardPath() {
  return window.location.pathname.replace(/\/+$/, "") === "/leaderboard";
}

async function loadPublicProfile(route, options = {}) {
  const routeKey = `${route.region}/${route.slug}`;
  if (!options.force && state.publicProfile?.routeKey === routeKey && !state.publicProfile.loading) {
    render();
    return;
  }

  if (state.publicProfile?.routeKey !== routeKey) {
    state.publicChampionSearch = "";
    if (dom.publicChampionSearch) dom.publicChampionSearch.value = "";
  }

  const previousData = state.publicProfile?.routeKey === routeKey ? state.publicProfile.data : null;
  state.publicProfile = {
    routeKey,
    loading: !previousData,
    refreshing: Boolean(options.force),
    error: "",
    data: previousData,
  };
  render();

  try {
    const fetchPublicBatch = async (forceRefresh) => {
      const params = new URLSearchParams({
        region: route.region,
        slug: route.slug,
        limit: String(RIOT_SEASON_SYNC_LIMIT),
        batch: String(RIOT_SEASON_SYNC_LIMIT),
      });
      if (forceRefresh) params.set("refresh", "1");
      return apiRequest(`/api/public-profile?${params.toString()}`, {
        timeoutMs: forceRefresh ? RIOT_SEASON_SYNC_TIMEOUT_MS : 60000,
      });
    };

    let data = await fetchPublicBatch(Boolean(options.force));
    state.publicProfile = {
      routeKey,
      loading: false,
      refreshing: false,
      error: "",
      data,
    };
    render();

    state.publicProfile = {
      routeKey,
      loading: false,
      refreshing: false,
      error: data.sync?.hasMore ? "Synchronizacja zatrzymała się przed końcem. Spróbuj ponownie za chwilę." : "",
      data,
    };
  } catch (error) {
    state.publicProfile = {
      routeKey,
      loading: false,
      refreshing: false,
      error: error.message,
      data: previousData,
    };
  }

  render();
}

async function loadLeaderboard(options = {}) {
  const region = getLeaderboardRegion();
  if (state.leaderboard.region !== region) {
    state.leaderboard = {
      loading: false,
      error: "",
      rows: [],
      updatedAt: "",
      region,
    };
  }
  if (!state.backendAvailable && !options.force) {
    renderLeaderboard();
    return;
  }
  if (state.leaderboard.loading) return;
  if (state.leaderboard.rows.length && !options.force) {
    renderLeaderboard();
    return;
  }

  state.leaderboard = {
    ...state.leaderboard,
    region,
    loading: true,
    error: "",
  };
  renderLeaderboard();

  try {
    const params = new URLSearchParams({ limit: "50", region });
    const data = await apiRequest(`/api/leaderboard?${params.toString()}`, { timeoutMs: 60000 });
    state.leaderboard = {
      loading: false,
      error: "",
      rows: Array.isArray(data.rows) ? data.rows : [],
      updatedAt: data.updatedAt || new Date().toISOString(),
      region: data.region || region,
    };
  } catch (error) {
    state.leaderboard = {
      ...state.leaderboard,
      loading: false,
      error: error.message,
    };
  }

  renderLeaderboard();
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
  renderLiveGame();
  renderPublicProfile();
  renderLeaderboard();
  renderAccount();
  renderResetTokenView();
}

function renderProfileHero(matches) {
  const ownPublicProfile = isViewingOwnProfile();
  const publicData = state.publicRoute && !ownPublicProfile ? state.publicProfile?.data : null;
  const publicState = state.publicRoute && !ownPublicProfile ? state.publicProfile : null;
  const profile = publicData?.profile || state.user?.riotProfile;
  const won = getWonChampionStats(matches).length;
  const total = CHAMPIONS.length;
  dom.profileHeroAvatar.src = profile?.profileIconUrl || getAccountAvatarSrc() || DEFAULT_AUTH_AVATAR;
  dom.profileHeroName.textContent = publicState?.error && !publicData
    ? t("public.notFound")
    : profile
      ? `${profile.gameName}#${profile.tagLine}`
      : "ArenaTracker";

  const meta = [];
  if (state.publicRoute) meta.push(t("public.profile"));
  if (profile?.region) meta.push(regionLabel(profile.region));
  meta.push(`${won} / ${total} ${t("common.championsWon")}`);
  if (profile?.lastSyncedAt) {
    meta.push(`${t("common.lastSync")}: ${relativeTime(profile.lastSyncedAt)}`);
  }
  dom.profileHeroMeta.replaceChildren(...meta.map((item) => el("span", "profile-meta-pill", item)));

  const canSync = state.publicRoute
    ? Boolean(state.backendAvailable && !publicState?.loading && !publicState?.refreshing)
    : Boolean(state.user?.riotProfile && state.backendAvailable && !state.isAutoSyncing);
  dom.profileSyncButton.disabled = !canSync;
  const isSyncing = state.isAutoSyncing || Boolean(publicState?.loading || publicState?.refreshing);
  dom.profileSyncButton.textContent = isSyncing
    ? state.language === "en" ? "Syncing..." : "Synchronizuję..."
    : t("actions.sync");
  dom.profileSyncNote.textContent = publicState?.error
    ? publicState.error
    : isSyncing
    ? "Synchronizuję..."
    : profile || state.publicRoute
      ? ""
      : state.language === "en"
        ? "Search a player profile to sync public Arena data."
        : "Wyszukaj profil gracza, zeby synchronizowac publiczne dane Areny.";
}

function renderVictoryProgress(matches) {
  const won = getWonChampionStats(matches);
  const total = CHAMPIONS.length;
  const completed = won.length;
  const percent = total ? (completed / total) * 100 : 0;

  dom.progressCounter.replaceChildren(
    el("span", "progress-score", `${completed}/${total}`),
    el("span", "progress-percent", `${Math.round(percent)}%`),
  );
  dom.victoryProgress.style.setProperty("--progress", `${percent}%`);
  dom.victoryProgress.querySelector("span").style.width = `${percent}%`;
  dom.victoryProgress.setAttribute("aria-label", `${completed} / ${total} ${t("common.championsWon")}`);
}

function renderLeaderboard() {
  if (!dom.leaderboardRows || !dom.leaderboardPodium) return;
  const { rows, loading, error, region } = state.leaderboard;
  if (dom.leaderboardRegionLabel) {
    const label = regionLabel(region || getLeaderboardRegion());
    dom.leaderboardRegionLabel.textContent = state.language === "en"
      ? `Live season - ${label}`
      : `Sezon live - ${label}`;
  }

  if (dom.leaderboardRefreshButton) {
    dom.leaderboardRefreshButton.disabled = loading;
    dom.leaderboardRefreshButton.classList.toggle("is-syncing", loading);
    dom.leaderboardRefreshButton.textContent = loading
      ? state.language === "en" ? "Refreshing..." : "Odswiezam..."
      : state.language === "en" ? "Refresh" : "Odswiez";
  }

  if (loading && !rows.length) {
    dom.leaderboardPodium.replaceChildren(emptyState(
      state.language === "en" ? "Loading leaderboard." : "Laduje leaderboard.",
      state.language === "en" ? "Synced profiles will appear here." : "Zsynchronizowane profile pojawia sie tutaj.",
    ));
    dom.leaderboardRows.replaceChildren();
    return;
  }

  if (error && !rows.length) {
    dom.leaderboardPodium.replaceChildren();
    dom.leaderboardRows.replaceChildren(emptyState(error, state.backendAvailable ? "" : "Uruchom node server.js."));
    return;
  }

  if (!rows.length) {
    dom.leaderboardPodium.replaceChildren();
    dom.leaderboardRows.replaceChildren(emptyState(
      state.language === "en" ? "No synced profiles yet." : "Nie ma jeszcze zsynchronizowanych profili.",
      state.language === "en" ? "Search and sync a profile first." : "Najpierw wyszukaj i zsynchronizuj profil.",
    ));
    return;
  }

  dom.leaderboardPodium.replaceChildren(...renderLeaderboardPodium(rows.slice(0, 3)));
  dom.leaderboardRows.replaceChildren(renderLeaderboardHeader(), ...rows.map(renderLeaderboardRow));
}

function renderLeaderboardHeader() {
  const root = el("div", "leaderboard-row leaderboard-header");
  root.append(
    el("span", "", "Rank"),
    el("span", "", ""),
    el("span", "", state.language === "en" ? "Player" : "Gracz"),
    el("span", "", "Score"),
    el("span", "", state.language === "en" ? "Champions" : "Championi"),
    el("span", "", state.language === "en" ? "Wins" : "Winy"),
    el("span", "", "Top 4"),
    el("span", "", state.language === "en" ? "Matches" : "Mecze"),
  );
  return root;
}

function renderLeaderboardPodium(rows) {
  const ordered = [rows[1], rows[0], rows[2]].filter(Boolean);
  return ordered.map((row) => {
    const card = el("button", `leaderboard-podium-card is-rank-${row.rank}`);
    card.type = "button";
    card.dataset.publicPath = row.publicPath;
    card.append(
      el("span", "leaderboard-rank-crown", row.rank === 1 ? "#1" : `#${row.rank}`),
      imageIcon(row.profileIconUrl || DEFAULT_AUTH_AVATAR, "leaderboard-avatar"),
      el("strong", "", row.gameName || "Unknown"),
      el("span", "", `#${row.tagLine || ""}`),
      el("em", "", `${row.championWins || 0} / ${CHAMPIONS.length}`),
    );
    return card;
  });
}

function renderLeaderboardRow(row) {
  const root = el("button", "leaderboard-row");
  root.type = "button";
  root.dataset.publicPath = row.publicPath;
  root.append(
    el("strong", "leaderboard-rank", `#${row.rank}`),
    imageIcon(row.profileIconUrl || DEFAULT_AUTH_AVATAR, "leaderboard-row-avatar"),
    el("span", "leaderboard-player", `${row.gameName}#${row.tagLine}`),
    el("strong", "leaderboard-score", String(row.score || 0)),
    el("span", "", String(row.championWins || 0)),
    el("span", "", String(row.wins || 0)),
    el("span", "", String(row.top4 || 0)),
    el("span", "", String(row.matches || 0)),
  );
  return root;
}

function renderAccount() {
  if (!dom.accountMenuLabel || !dom.accountOverlay) return;
  dom.accountMenuLabel.textContent = state.user ? state.user.displayName : t("account.label");
  dom.accountOverlay.classList.toggle("is-profile-mode", Boolean(state.user));
  updateAccountAvatars();
  renderAccountPublicLink();

  dom.authForms.classList.toggle("is-hidden", Boolean(state.user));
  dom.profilePanel.classList.toggle("is-hidden", !state.user);

  if (!state.user) {
    dom.accountTitle.textContent ||= t("account.login");
    dom.profileName.textContent = t("account.label");
    dom.profileEmail.textContent = "";
    dom.riotSyncStatus.replaceChildren(
      el("strong", "", state.language === "en" ? "Sign in to save a League account." : "Po zalogowaniu zapiszesz konto League."),
      el("span", "", state.backendAvailable
        ? state.language === "en" ? "Sync will start automatically." : "Synchronizacja ruszy automatycznie."
        : state.language === "en" ? "Start node server.js." : "Uruchom node server.js."),
    );
    return;
  }

  dom.accountTitle.textContent = t("account.label");
  dom.accountStatus.replaceChildren();
  dom.accountStatus.classList.add("is-hidden");
  dom.profileName.textContent = state.user.displayName;
  dom.profileEmail.textContent = state.user.email;

  const profile = state.user.riotProfile;
  if (!profile) {
    dom.riotSyncStatus.replaceChildren(
      el("strong", "", t("account.noLeague")),
      el("span", "", t("account.noLeagueCaption")),
    );
    return;
  }

  if (state.isAutoSyncing) {
    dom.riotSyncStatus.replaceChildren(
      el("strong", "", state.language === "en" ? "Syncing..." : "Synchronizuję..."),
      el("span", "", t("account.syncingCaption")),
    );
    return;
  }

  if (state.syncError) {
    dom.riotSyncStatus.replaceChildren(
      el("strong", "", t("account.syncFailed")),
      el("span", "", state.syncError),
    );
    return;
  }

  dom.riotSyncStatus.replaceChildren(
    el("strong", "", `${profile.gameName}#${profile.tagLine}`),
    el(
      "span",
      "",
      profile.lastSyncedAt
        ? `${t("common.lastSync")}: ${relativeTime(profile.lastSyncedAt)}.`
        : profile.verifiedAt
          ? `${t("account.verified")}: ${formatDate(profile.verifiedAt)}.`
          : t("account.localProfile"),
    ),
  );
}

function renderAccountPublicLink() {
  const path = state.user?.riotProfile?.publicPath;
  if (!dom.publicProfileLinkBox || !dom.publicProfileLink) return;
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
    dom.publicProfileMeta?.replaceChildren();
    renderPublicSyncState();
    renderPublicProgress({ won: 0, total: CHAMPIONS.length });
    dom.publicWonChampions.replaceChildren();
    dom.publicMatchHistory?.replaceChildren();
    dom.publicTopDuo.replaceChildren();
    return;
  }

  if (publicState.loading && !publicState.data) {
    dom.publicProfileTitle.textContent = state.language === "en" ? "Syncing..." : "Synchronizuję...";
    dom.publicProfileMeta?.replaceChildren();
    renderPublicSyncState(publicState);
    renderPublicProgress({ won: 0, total: CHAMPIONS.length });
    dom.publicWonChampions.replaceChildren(emptyState(t("public.loading"), t("public.wait")));
    dom.publicMatchHistory?.replaceChildren();
    dom.publicTopDuo.replaceChildren();
    return;
  }

  if (publicState.error && !publicState.data) {
    dom.publicProfileTitle.textContent = t("public.notFound");
    dom.publicProfileMeta?.replaceChildren();
    renderPublicSyncState(publicState);
    renderPublicProgress({ won: 0, total: CHAMPIONS.length });
    dom.publicWonChampions.replaceChildren(emptyState(publicState.error, t("public.checkLink")));
    dom.publicMatchHistory?.replaceChildren();
    dom.publicTopDuo.replaceChildren();
    return;
  }

  const data = publicState.data;
  renderPublicSyncState(publicState);
  dom.publicProfileAvatar.src = data.profile.profileIconUrl || DEFAULT_AUTH_AVATAR;
  dom.publicProfileTitle.textContent = `${data.profile.gameName}#${data.profile.tagLine}`;
  const meta = [
    regionLabel(data.profile.region),
    `${data.progress.won} / ${data.progress.total} ${t("common.championsWon")}`,
  ];
  if (data.profile.lastSyncedAt) {
    meta.push(`${state.language === "en" ? "Last sync" : "Ostatni sync"}: ${relativeTime(data.profile.lastSyncedAt)}`);
  }
  dom.publicProfileMeta?.replaceChildren(...meta.map((item) => el("span", "profile-meta-pill", item)));
  renderPublicProgress(data.progress);
  const championQuery = normalizeLookupKey(state.publicChampionSearch);
  const wonChampions = championQuery
    ? data.wonChampions.filter((stat) => normalizeLookupKey(stat.champion).includes(championQuery))
    : data.wonChampions;
  dom.publicWonChampions.replaceChildren(
    ...(wonChampions.length
      ? wonChampions.map((stat) => renderPublicChampionCard(
          stat,
          `${stat.wins} ${t("common.win")} · ${t("common.average")} #${formatAveragePlacement(stat.averagePlacement)}`,
        ))
      : [data.wonChampions.length
          ? emptyState(t("public.noResults"), t("public.changeSearch"))
          : emptyState(t("public.noWonChampions"), t("public.noWonCaption"))]),
  );
  dom.publicMatchHistory?.replaceChildren(
    ...(data.matches?.length
      ? data.matches
          .slice(0, 8)
          .map(normalizeMatch)
          .filter(Boolean)
          .map((match) => renderMatchCard(match, { dense: true, public: true }))
      : [emptyState(t("public.noHistory"), t("public.noHistoryCaption"))]),
  );
  dom.publicTopDuo.replaceChildren(
    ...(data.topDuo.length
      ? data.topDuo.map((stat) => {
          const root = el("article", "partner-card");
          root.append(
            el("strong", "", stat.name),
            el("span", "", `${stat.games} ${t("common.gamesLower")} · ${t("common.average")} #${formatAveragePlacement(stat.averagePlacement)}`),
          );
          return root;
        })
      : [emptyState(t("public.noDuo"), t("public.noDuoCaption"))]),
  );
}

function renderPublicSyncState(publicState = state.publicProfile) {
  const isBusy = Boolean(publicState?.loading || publicState?.refreshing);
  if (dom.publicSyncButton) {
    dom.publicSyncButton.disabled = isBusy;
    dom.publicSyncButton.classList.toggle("is-syncing", isBusy);
    dom.publicSyncButton.textContent = isBusy
      ? state.language === "en" ? "Syncing..." : "Synchronizuję..."
      : t("actions.sync");
  }
  if (dom.publicSyncStatus) {
    dom.publicSyncStatus.textContent = publicState?.error ? publicState.error : "";
  }
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
  setChampionCardBackground(root, stat.champion);
  const body = el("div", "champion-card-copy");
  body.append(el("strong", "", stat.champion), el("span", "", caption));
  root.append(body);
  return root;
}

function updateAccountAvatars() {
  const src = getAccountAvatarSrc();
  [dom.accountAvatar, dom.accountDialogAvatar, dom.profileAvatar, dom.profileHeroAvatar].forEach((image) => {
    if (!image) return;
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
  dom.languageFlag?.classList.toggle("is-pl", state.language !== "en");
  dom.languageFlag?.classList.toggle("is-en", state.language === "en");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  dom.playerSearchForms?.forEach(updateSearchPlaceholder);
}

function t(key) {
  return translations[state.language]?.[key] || translations.en[key] || translations.pl[key] || key;
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
  const publicMatches = state.publicRoute && !isViewingOwnProfile() && state.publicProfile?.data?.matches
    ? state.publicProfile.data.matches.map(normalizeMatch).filter(Boolean)
    : null;
  return [...(publicMatches || state.matches)]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function isViewingOwnProfile() {
  const profile = state.user?.riotProfile;
  if (!profile?.gameName || !profile?.tagLine || !state.publicRoute) return false;
  const ownSlug = normalizeLookupKey(`${profile.gameName}-${profile.tagLine}`);
  const routeSlug = normalizeLookupKey(safeDecode(state.publicRoute.slug));
  return normalizeRegion(profile.region) === normalizeRegion(state.publicRoute.region) && ownSlug === routeSlug;
}

function renderMetrics(matches) {
  const games = matches.length;
  const wins = matches.filter((match) => match.placement === 1).length;

  const cards = [
    {
      label: t("common.games"),
      value: games,
    },
    {
      label: t("common.wins"),
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
    empty.querySelector("strong").textContent = t("dashboard.noPartners");
    empty.querySelector("span").textContent = t("dashboard.noPartnersCaption");
    dom.partnerStats.replaceChildren(empty);
    return;
  }

  dom.partnerStats.replaceChildren(
    ...stats.slice(0, 12).map((stat) => {
      const root = el("article", "partner-card");
      root.append(
        el("strong", "", stat.name),
        el("span", "", `${stat.games} ${t("common.gamesLower")} · ${t("common.average")} #${formatAveragePlacement(stat.avg)}`),
      );
      return root;
    }),
  );
}

function renderFriendRanking(matches) {
  if (!dom.friendRanking) return;

  if (!state.user) {
    dom.friendRanking.replaceChildren(emptyState(t("friends.loginRequired"), t("friends.privateCaption")));
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
    apiRequest(`/api/public-profile?${params.toString()}`, { timeoutMs: 60000 })
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

  dom.collectionStatus.textContent = `${t("champions.completed")} ${wonCount} / ${CHAMPIONS.length}`;
  dom.collectionModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.collectionMode === mode);
  });

  if (!collection.length) {
    const empty = emptyState();
    empty.querySelector("strong").textContent = t("champions.noFiltered");
    empty.querySelector("span").textContent = t("champions.noFilteredCaption");
    dom.championCollection.replaceChildren(empty);
    return;
  }
  dom.championCollection.replaceChildren(...collection.map(renderChampionCollectionCard));
}

function renderChampionPill(stat) {
  const root = el("button", "champion-pill");
  root.type = "button";
  root.dataset.championDetail = stat.champion;
  setChampionCardBackground(root, stat.champion);
  const body = el("div", "champion-card-copy");
  body.append(el("strong", "", stat.champion));
  body.append(el("span", "", `${stat.wins} ${t("common.win")}`));
  root.append(body);
  return root;
}

function renderChampionCollectionCard(stat) {
  const root = el("button", `champion-collection-card ${stat.wins ? "is-complete" : "is-missing"}`);
  root.type = "button";
  root.dataset.championDetail = stat.champion;
  setChampionCardBackground(root, stat.champion);
  const body = el("div", "champion-card-copy");
  body.append(el("strong", "", stat.champion));
  body.append(
    el(
      "span",
      "",
      stat.wins
        ? `${stat.wins} ${t("common.win")}`
        : stat.games
          ? `${t("champions.bestPlace")} #${stat.bestPlacement}`
          : t("champions.noGames"),
    ),
  );
  root.append(body);
  return root;
}

function setChampionCardBackground(root, champion) {
  const championName = canonicalChampionName(champion);
  const src = championName ? CHAMPION_ICONS[championName] : "";
  if (src) root.style.setProperty("--champion-art", `url("${src}")`);
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
  const root = el("button", `match-card is-place-${match.placement}`);
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
    el("span", "tag", `${t("common.patch")} ${match.patch}`),
  );

  const augmentLimit = 6;
  const itemLimit = 7;
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
  const labelKey = label.toLowerCase().startsWith("augment") ? "common.augments" : "common.items";
  root.append(el("span", "asset-group-label", t(labelKey)));
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
  const root = el("span", `tag asset-tag ${normalized.tier ? `is-${normalized.tier}` : ""}`);
  const name = assetName(normalized);
  root.tabIndex = 0;
  root.title = name;
  if (normalized.icon) {
    root.append(imageIcon(normalized.icon, "tag-icon"));
  }
  root.append(el("span", "asset-tag-label", name));
  const tooltip = renderAssetTooltip(normalized);
  if (tooltip) root.append(tooltip);
  return root;
}

function renderAssetTooltip(asset) {
  const description = assetDescription(asset);
  if (!description && !asset.price && !asset.tier) return null;
  const root = el("span", "asset-tooltip");
  const head = el("span", "asset-tooltip-head");
  if (asset.icon) head.append(imageIcon(asset.icon, "asset-tooltip-icon"));
  const title = el("span", "asset-tooltip-title");
  title.append(el("strong", "", assetName(asset)));
  if (asset.price) title.append(el("em", "", `${asset.price} ${state.language === "en" ? "gold" : "złota"}`));
  head.append(title);
  root.append(head);
  if (description) root.append(el("span", "asset-tooltip-desc", description));
  if (asset.tier) root.append(el("span", `asset-tooltip-tier is-${asset.tier}`, tierLabel(asset.tier)));
  return root;
}

function assetName(asset) {
  return cleanText(asset.names?.[state.language] || asset.names?.en || asset.name || asset.id);
}

function assetDescription(asset) {
  return normalizeDescription(asset.descriptions?.[state.language] || asset.descriptions?.en || asset.description);
}

function tierLabel(tier) {
  const labels = {
    silver: state.language === "en" ? "Silver" : "Srebrny",
    gold: state.language === "en" ? "Gold" : "Złoty",
    prismatic: state.language === "en" ? "Prismatic" : "Pryzmatyczny",
    special: state.language === "en" ? "Special" : "Specjalny",
    boots: state.language === "en" ? "Boots" : "Buty",
    trinket: state.language === "en" ? "Trinket" : "Trinket",
  };
  return labels[tier] || tier;
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
    void syncRiotMatches({ automatic: true, deep: true, timeoutMs: RIOT_SEASON_SYNC_TIMEOUT_MS });
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
    showAccountMessage(t("account.loginRequired"), "error");
    return;
  }

  const body = Object.fromEntries(new FormData(dom.riotProfileForm).entries());
  const parsedInlineRiotId = parseRiotId(body.gameName);
  if (parsedInlineRiotId && !cleanText(body.tagLine)) {
    body.gameName = parsedInlineRiotId.gameName;
    body.tagLine = parsedInlineRiotId.tagLine;
  }

  if (!cleanText(body.gameName) || !cleanText(body.tagLine)) {
    showAccountMessage(t("account.completeRiotId"), "error");
    return;
  }

  const submitButton = dom.riotProfileForm.querySelector('button[type="submit"]');
  const previousLabel = submitButton?.textContent || "";
  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = t("account.saving");
    }
    state.syncError = "";
    const data = await apiRequest("/api/riot/profile", { method: "POST", body, timeoutMs: 30000 });
    state.user = data.user;
    fillRiotProfileForm();
    showAccountMessage(t("account.savedLeague"), "success");
    render();
    void syncRiotMatches({ automatic: true, deep: true, timeoutMs: RIOT_SEASON_SYNC_TIMEOUT_MS });
  } catch (error) {
    showAccountMessage(error.message, "error");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = previousLabel;
    }
  }
}

async function syncRiotMatches(options = {}) {
  if (!state.user) {
    if (!options.automatic) showAccountMessage(t("account.loginRequired"), "error");
    return;
  }

  if (!state.user.riotProfile) {
    return;
  }

  if (state.isAutoSyncing) {
    if (!options.automatic) showAccountMessage(t("account.syncAlreadyRunning"), "success");
    return;
  }

  state.isAutoSyncing = true;
  state.syncError = "";
  dom.riotSyncStatus.replaceChildren(
    el("strong", "", state.language === "en" ? "Syncing..." : "Synchronizuję..."),
    el("span", "", state.language === "en" ? "Working through Arena history." : "Pracuję nad historią Areny."),
  );

  const syncLimit = RIOT_SEASON_SYNC_LIMIT;
  const syncTimeout = options.timeoutMs || RIOT_SEASON_SYNC_TIMEOUT_MS;
  let processedCount = 0;
  let latestData = null;

  try {
    const data = await apiRequest("/api/riot/sync", {
      method: "POST",
      timeoutMs: syncTimeout,
      body: {
        limit: syncLimit,
        batch: syncLimit,
        scope: "season",
      },
    });
    latestData = data;
    processedCount = data.totalRiotMatchCount || ((data.scannedCount || 0) + (data.reusedCount || 0));
    state.user = data.user;
    state.matches = data.matches.map(normalizeMatch).filter(Boolean);
    state.syncError = "";
    fillRiotProfileForm();
    dom.riotSyncStatus.replaceChildren(
      el("strong", "", state.language === "en" ? "Syncing..." : "Synchronizuję..."),
      el("span", "", state.language === "en" ? "Finishing update." : "Kończę aktualizację."),
    );
    render();

    state.syncError = "";
    fillRiotProfileForm();
    if (!options.automatic) {
      showAccountMessage(
        state.language === "en"
          ? `Synced ${processedCount} matches.`
          : `Zsynchronizowano ${processedCount} meczów.`,
        "success",
      );
    }
    if (latestData?.hasMore) {
      state.syncError = state.language === "en"
        ? "Sync stopped before finishing. Try again in a moment."
        : "Synchronizacja zatrzymała się przed końcem. Spróbuj ponownie za chwilę.";
    } else {
      await checkLiveGameForCurrentProfile({ navigateIfActive: true, force: true });
    }
    render();
  } catch (error) {
    state.syncError = error.message;
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
  const controller = options.timeoutMs ? new AbortController() : null;
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), options.timeoutMs)
    : null;
  const request = {
    method: options.method || "GET",
    credentials: "same-origin",
    headers,
  };
  if (controller) request.signal = controller.signal;

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    request.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(path, request);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(state.language === "en"
        ? "Request timed out. Try again in a moment."
        : "Przekroczono czas oczekiwania. Spróbuj ponownie za chwilę.");
    }
    throw error;
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }

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
    playedAt: cleanText(match.playedAt),
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
    .sort((a, b) => a.champion.localeCompare(b.champion));
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
    teamId: cleanText(value.teamId ?? value.playerSubteamId),
    augments: Array.isArray(value.augments) ? value.augments.map(resolveAugmentTag).filter(Boolean) : [],
    items: Array.isArray(value.items) ? value.items.map(resolveItemTag).filter(Boolean) : [],
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
  return resolveGameAssetTag(value, GAME_DATA.items, GAME_DATA.itemIcons, GAME_DATA.itemAliases, ITEM_DETAILS);
}

function resolveAugmentName(value) {
  return resolveAugmentTag(value)?.name || "";
}

function resolveAugmentTag(value) {
  return resolveGameAssetTag(value, GAME_DATA.augments, GAME_DATA.augmentIcons, GAME_DATA.augmentAliases, AUGMENT_DETAILS);
}

function resolveGameAssetTag(value, names = {}, icons = {}, aliases = {}, details = {}) {
  const source = value && typeof value === "object" ? value : {};
  const rawText = source.name ?? source.label ?? value;
  const text = cleanText(rawText);
  const rawId = cleanText(source.id || source.itemId || source.augmentId || extractNumericId(text));
  const aliasId = aliases?.[normalizeLookupKey(text)] || "";
  const id = names?.[rawId] ? rawId : aliasId || rawId;
  const detail = details?.[id] || {};
  const name = detail.names?.en || names?.[id] || text;
  if (rawId && text === rawId && !names?.[rawId]) return null;
  if (!name) return null;

  return {
    id,
    name,
    names: {
      ...(detail.names || {}),
      ...(source.names || {}),
      en: cleanText(source.names?.en || source.name || detail.names?.en || name),
      ...(source.names?.pl || detail.names?.pl ? { pl: cleanText(source.names?.pl || detail.names?.pl) } : {}),
    },
    descriptions: {
      ...(detail.descriptions || {}),
      ...(source.descriptions || {}),
    },
    icon: cleanText(source.icon || detail.icon || icons?.[id]),
    tier: cleanText(source.tier || detail.tier),
    price: Number(source.price || detail.price || 0),
  };
}

function normalizeAssetTag(value) {
  if (value && typeof value === "object") {
    const id = cleanText(value.id || value.itemId || value.augmentId);
    const detail = ITEM_DETAILS[id] || AUGMENT_DETAILS[id] || {};
    return resolveGameAssetTag(
      {
        ...value,
        id,
        name: value.name || detail.names?.en,
        icon: value.icon || detail.icon,
      },
      { [id]: detail.names?.en || value.name || id },
      { [id]: detail.icon || value.icon || "" },
      {},
      { [id]: detail },
    ) || {
      id,
      name: cleanText(value.name || value.label || value.id),
      names: value.names || {},
      descriptions: value.descriptions || {},
      icon: cleanText(value.icon),
      tier: cleanText(value.tier),
      price: Number(value.price || 0),
    };
  }
  return {
    name: cleanText(value),
    names: {},
    descriptions: {},
    icon: "",
    tier: "",
    price: 0,
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

function normalizeDescription(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
  return String(value ?? "").trim().replace(/\s+/g, " ");
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
  return new Intl.DateTimeFormat(state.language === "en" ? "en" : "pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat(state.language === "en" ? "en" : "pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
