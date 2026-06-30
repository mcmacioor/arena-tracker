const APP_VERSION = "0.2.0";
const DATA_DRAGON_VERSION = "16.13.1";
const STORAGE_KEY = "arenatracker.matches.v1";

const CHAMPIONS = [
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
  matches: [],
  filters: {
    patch: "",
    champion: "",
    range: "all",
  },
};

const dom = {};

document.documentElement.dataset.appVersion = APP_VERSION;

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  fillChampionDatalist();
  setDefaultFormValues();
  bindEvents();
  state.matches = loadMatches();
  syncFiltersFromDom();
  updateRoute();
  render();
});

function cacheDom() {
  Object.assign(dom, {
    dataPatch: document.getElementById("dataPatch"),
    seedSampleButton: document.getElementById("seedSampleButton"),
    patchFilter: document.getElementById("patchFilter"),
    championFilter: document.getElementById("championFilter"),
    rangeFilter: document.getElementById("rangeFilter"),
    metricsGrid: document.getElementById("metricsGrid"),
    insightList: document.getElementById("insightList"),
    recentMatches: document.getElementById("recentMatches"),
    matchForm: document.getElementById("matchForm"),
    matchDate: document.getElementById("matchDate"),
    matchPatch: document.getElementById("matchPatch"),
    matchList: document.getElementById("matchList"),
    exportButton: document.getElementById("exportButton"),
    importInput: document.getElementById("importInput"),
    championTable: document.getElementById("championTable"),
    plannerForm: document.getElementById("plannerForm"),
    plannerChampion: document.getElementById("plannerChampion"),
    plannerPartner: document.getElementById("plannerPartner"),
    plannerResult: document.getElementById("plannerResult"),
    watchlist: document.getElementById("watchlist"),
    championOptions: document.getElementById("championOptions"),
    emptyStateTemplate: document.getElementById("emptyStateTemplate"),
  });

  dom.dataPatch.textContent = DATA_DRAGON_VERSION;
}

function fillChampionDatalist() {
  const fragment = document.createDocumentFragment();
  CHAMPIONS.forEach((champion) => {
    const option = document.createElement("option");
    option.value = champion;
    fragment.append(option);
  });
  dom.championOptions.replaceChildren(fragment);
}

function setDefaultFormValues() {
  dom.matchDate.value = today();
  dom.matchPatch.value = DATA_DRAGON_VERSION.split(".").slice(0, 2).join(".");
}

function bindEvents() {
  window.addEventListener("hashchange", updateRoute);

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => setActiveRoute(link.dataset.route));
  });

  [dom.patchFilter, dom.championFilter, dom.rangeFilter].forEach((control) => {
    control.addEventListener("input", () => {
      syncFiltersFromDom();
      render();
    });
  });

  dom.seedSampleButton.addEventListener("click", () => {
    const canSeed =
      state.matches.length === 0 ||
      window.confirm("Zastąpić obecne dane przykładową sesją demo?");
    if (!canSeed) return;

    state.matches = SAMPLE_MATCHES.map((match, index) => ({
      ...match,
      id: `demo-${index + 1}`,
      createdAt: new Date().toISOString(),
    }));
    persistMatches();
    render();
  });

  dom.matchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const match = readMatchForm();
    state.matches.unshift(match);
    persistMatches();
    dom.matchForm.reset();
    setDefaultFormValues();
    window.location.hash = "matches";
    render();
  });

  dom.matchForm.addEventListener("reset", () => {
    requestAnimationFrame(setDefaultFormValues);
  });

  [dom.matchList, dom.recentMatches].forEach((list) => {
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-delete]");
      if (!button) return;

      const match = state.matches.find((item) => item.id === button.dataset.delete);
      if (!match) return;

      const ok = window.confirm(
        `Usunąć mecz ${match.champion}${match.partner ? ` + ${match.partner}` : ""}?`,
      );
      if (!ok) return;

      state.matches = state.matches.filter((item) => item.id !== match.id);
      persistMatches();
      render();
    });
  });

  dom.exportButton.addEventListener("click", exportMatches);
  dom.importInput.addEventListener("change", importMatches);

  dom.plannerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderPlannerResult();
  });
}

function setActiveRoute(route) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.route === route);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-visible", view.dataset.view === route);
  });
}

function updateRoute() {
  const route = window.location.hash.replace("#", "") || "dashboard";
  const knownRoute = document.querySelector(`[data-view="${route}"]`) ? route : "dashboard";
  setActiveRoute(knownRoute);
}

function syncFiltersFromDom() {
  state.filters.patch = normalize(dom.patchFilter.value);
  state.filters.champion = normalize(dom.championFilter.value);
  state.filters.range = dom.rangeFilter.value;
}

function render() {
  const matches = getFilteredMatches();
  renderMetrics(matches);
  renderInsights(matches);
  renderMatchList(dom.recentMatches, matches.slice(0, 5), { compact: true });
  renderMatchList(dom.matchList, matches);
  renderChampionTable(matches);
  renderWatchlist(matches);
  renderPlannerResult();
}

function getFilteredMatches() {
  const rangeDays = Number(state.filters.range);
  const rangeCutoff = Number.isFinite(rangeDays)
    ? new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000)
    : null;

  return [...state.matches]
    .filter((match) => {
      const patchMatches = !state.filters.patch || normalize(match.patch).includes(state.filters.patch);
      const championHaystack = normalize(`${match.champion} ${match.partner}`);
      const championMatches =
        !state.filters.champion || championHaystack.includes(state.filters.champion);
      const dateMatches = !rangeCutoff || new Date(match.date) >= rangeCutoff;
      return patchMatches && championMatches && dateMatches;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderMetrics(matches) {
  const games = matches.length;
  const avgPlacement = games ? average(matches.map((match) => match.placement)) : 0;
  const topTwo = games
    ? percentage(matches.filter((match) => match.placement <= 2).length / games)
    : "0%";
  const wins = games
    ? percentage(matches.filter((match) => match.placement === 1).length / games)
    : "0%";
  const ratingDelta = sum(matches.map((match) => match.ratingDelta));
  const bestChampion = findBestChampion(matches);

  const cards = [
    {
      label: "Gry",
      value: games,
      note: games === 1 ? "1 zapisany mecz" : `${games} zapisanych meczów`,
    },
    {
      label: "Średnie miejsce",
      value: games ? avgPlacement.toFixed(2) : "-",
      note: avgPlacement <= 2.5 && games ? "tempo na climb" : "niżej znaczy lepiej",
    },
    {
      label: "Top 2",
      value: topTwo,
      note: `Win rate: ${wins}`,
    },
    {
      label: "Rating",
      value: signed(ratingDelta),
      note: bestChampion ? `Najlepiej: ${bestChampion.champion}` : "brak lidera",
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

function renderInsights(matches) {
  if (!matches.length) {
    dom.insightList.replaceChildren(emptyState());
    return;
  }

  const insights = [];
  const bestChampion = findBestChampion(matches);
  const bestDuo = findBestDuo(matches);
  const riskChampion = findRiskChampion(matches);
  const bestAugment = findBestTag(matches, "augments");
  const ratingDelta = sum(matches.map((match) => match.ratingDelta));

  if (bestChampion) {
    insights.push({
      title: `${bestChampion.champion} jest teraz najstabilniejszym pickiem`,
      text: `${bestChampion.games} gry, średnie miejsce ${bestChampion.avg.toFixed(2)}, top 2 ${percentage(
        bestChampion.topTwo / bestChampion.games,
      )}.`,
    });
  }

  if (bestDuo) {
    insights.push({
      title: `Duet ${bestDuo.names.join(" + ")} ma najlepszy sygnał`,
      text: `${bestDuo.games} gry, średnie miejsce ${bestDuo.avg.toFixed(2)}. Warto powtórzyć przy podobnych banach.`,
    });
  }

  if (bestAugment) {
    insights.push({
      title: `${bestAugment.name} najczęściej kończy w top 2`,
      text: `${bestAugment.topTwo} top 2 na ${bestAugment.games} gier z tym augmentem w filtrze.`,
    });
  }

  if (riskChampion) {
    insights.push({
      title: `${riskChampion.champion} wymaga korekty planu`,
      text: `Średnie miejsce ${riskChampion.avg.toFixed(2)} przy ${riskChampion.games} grach. Sprawdź build i partnera.`,
    });
  }

  insights.push({
    title: ratingDelta >= 0 ? "Sesja jest na plusie" : "Sesja traci rating",
    text: `Suma zmian ratingu dla aktualnego filtra: ${signed(ratingDelta)}.`,
  });

  dom.insightList.replaceChildren(...insights.slice(0, 4).map(renderInsightCard));
}

function renderInsightCard(insight) {
  const root = el("article", "insight-card");
  root.append(el("strong", "", insight.title));
  root.append(el("span", "", insight.text));
  return root;
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
    el("span", "tag", signed(match.ratingDelta)),
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

function renderChampionTable(matches) {
  const rows = getChampionStats(matches)
    .sort((a, b) => b.games - a.games || a.avg - b.avg)
    .map((stat) => {
      const tr = document.createElement("tr");
      [
        stat.champion,
        stat.games,
        stat.avg.toFixed(2),
        percentage(stat.topTwo / stat.games),
        stat.bestPartner || "-",
        stat.bestAugment || "-",
      ].forEach((value) => tr.append(el("td", "", value)));
      return tr;
    });

  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = el("td", "", "Brak danych dla wybranych filtrów.");
    td.colSpan = 6;
    tr.append(td);
    dom.championTable.replaceChildren(tr);
    return;
  }

  dom.championTable.replaceChildren(...rows);
}

function renderWatchlist(matches) {
  if (!matches.length) {
    dom.watchlist.replaceChildren(emptyState());
    return;
  }

  const stats = getChampionStats(matches);
  const best = stats
    .filter((item) => item.games >= 2)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);
  const weak = stats
    .filter((item) => item.games >= 1)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 2);

  const items = [
    ...best.map((item) => ({
      title: `Powtórz ${item.champion}${item.bestPartner ? ` + ${item.bestPartner}` : ""}`,
      text: `Średnie miejsce ${item.avg.toFixed(2)} przy ${item.games} grach.`,
    })),
    ...weak.map((item) => ({
      title: `Zrewiduj plan na ${item.champion}`,
      text: `Najgorszy sygnał w filtrze. Sprawdź partnera, pierwszy item i trzeci augment.`,
    })),
  ];

  dom.watchlist.replaceChildren(...items.slice(0, 5).map(renderWatchItem));
}

function renderWatchItem(item) {
  const root = el("article", "watch-item");
  root.append(el("strong", "", item.title), el("span", "", item.text));
  return root;
}

function renderPlannerResult() {
  const champion = cleanText(dom.plannerChampion.value);
  const partner = cleanText(dom.plannerPartner.value);

  if (!champion && !partner) {
    dom.plannerResult.replaceChildren(
      el("strong", "", "Wybierz bohatera lub duet."),
      el("span", "", "Planner porówna zapisane gry z aktualnego dziennika."),
    );
    return;
  }

  const selected = state.matches.filter((match) => {
    const names = [normalize(match.champion), normalize(match.partner)].filter(Boolean);
    const hasChampion = !champion || names.includes(normalize(champion));
    const hasPartner = !partner || names.includes(normalize(partner));
    return hasChampion && hasPartner;
  });

  if (!selected.length) {
    dom.plannerResult.replaceChildren(
      el("strong", "", "Brak zapisanych prób."),
      el("span", "", "Dodaj choć jeden mecz tym pickiem, żeby planner miał na czym pracować."),
    );
    return;
  }

  const avgPlacement = average(selected.map((match) => match.placement));
  const topTwo = percentage(selected.filter((match) => match.placement <= 2).length / selected.length);
  const bestAugment = findBestTag(selected, "augments");
  const ratingDelta = sum(selected.map((match) => match.ratingDelta));
  const verdict =
    avgPlacement <= 2.5
      ? "Dobry sygnał na kolejną sesję."
      : avgPlacement <= 4
        ? "Grywalne, ale wymaga dobrego draftu."
        : "Ryzykowny pick bez korekty planu.";

  dom.plannerResult.replaceChildren(
    el("strong", "", verdict),
    el(
      "span",
      "",
      `${selected.length} gry, średnie miejsce ${avgPlacement.toFixed(2)}, top 2 ${topTwo}, rating ${signed(
        ratingDelta,
      )}.`,
    ),
    el("span", "", bestAugment ? `Najlepszy augment w próbkach: ${bestAugment.name}.` : ""),
  );
}

function readMatchForm() {
  const form = new FormData(dom.matchForm);
  return {
    id: makeId(),
    date: form.get("date"),
    patch: cleanText(form.get("patch")),
    champion: cleanText(form.get("champion")),
    partner: cleanText(form.get("partner")),
    placement: Number(form.get("placement")),
    ratingDelta: Number(form.get("ratingDelta") || 0),
    augments: splitTags(form.get("augments")),
    items: splitTags(form.get("items")),
    note: cleanText(form.get("note")),
    createdAt: new Date().toISOString(),
  };
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
}

function importMatches(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      const imported = Array.isArray(parsed) ? parsed : parsed.matches;
      if (!Array.isArray(imported)) throw new Error("Invalid ArenaTracker export");

      const normalized = imported.map(normalizeMatch).filter(Boolean);
      state.matches = normalized;
      persistMatches();
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
    augments: Array.isArray(match.augments) ? match.augments.map(cleanText).filter(Boolean) : [],
    items: Array.isArray(match.items) ? match.items.map(cleanText).filter(Boolean) : [],
    note: cleanText(match.note),
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
        placements: [],
        topTwo: 0,
        partners: new Map(),
        augments: new Map(),
      });
    }

    const stat = grouped.get(key);
    stat.games += 1;
    stat.placements.push(match.placement);
    if (match.placement <= 2) stat.topTwo += 1;
    increment(stat.partners, match.partner || "Solo/unknown");
    match.augments.forEach((augment) => increment(stat.augments, augment));
  });

  return [...grouped.values()].map((stat) => ({
    ...stat,
    avg: average(stat.placements),
    bestPartner: mapLeader(stat.partners),
    bestAugment: mapLeader(stat.augments),
  }));
}

function findBestChampion(matches) {
  return getChampionStats(matches)
    .filter((stat) => stat.games >= 2)
    .sort((a, b) => a.avg - b.avg || b.topTwo / b.games - a.topTwo / a.games)[0];
}

function findRiskChampion(matches) {
  return getChampionStats(matches)
    .filter((stat) => stat.games >= 2)
    .sort((a, b) => b.avg - a.avg)[0];
}

function findBestDuo(matches) {
  const duos = new Map();

  matches
    .filter((match) => match.partner)
    .forEach((match) => {
      const names = [match.champion, match.partner].sort((a, b) => a.localeCompare(b));
      const key = names.join(" + ");
      if (!duos.has(key)) {
        duos.set(key, { names, games: 0, placements: [], topTwo: 0 });
      }
      const duo = duos.get(key);
      duo.games += 1;
      duo.placements.push(match.placement);
      if (match.placement <= 2) duo.topTwo += 1;
    });

  return [...duos.values()]
    .filter((duo) => duo.games >= 2)
    .map((duo) => ({ ...duo, avg: average(duo.placements) }))
    .sort((a, b) => a.avg - b.avg || b.topTwo / b.games - a.topTwo / a.games)[0];
}

function findBestTag(matches, key) {
  const grouped = new Map();

  matches.forEach((match) => {
    match[key].forEach((name) => {
      if (!grouped.has(name)) grouped.set(name, { name, games: 0, topTwo: 0 });
      const item = grouped.get(name);
      item.games += 1;
      if (match.placement <= 2) item.topTwo += 1;
    });
  });

  return [...grouped.values()].sort(
    (a, b) => b.topTwo - a.topTwo || b.games - a.games || a.name.localeCompare(b.name),
  )[0];
}

function increment(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function mapLeader(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
}

function splitTags(value) {
  return cleanText(value)
    .split(/[,;]+/)
    .map(cleanText)
    .filter(Boolean);
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

function percentage(value) {
  return `${Math.round(value * 100)}%`;
}

function signed(value) {
  const number = Number(value || 0);
  return number > 0 ? `+${number}` : String(number);
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function today() {
  return new Date().toISOString().slice(0, 10);
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

function emptyState() {
  return dom.emptyStateTemplate.content.firstElementChild.cloneNode(true);
}

function el(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
