import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outPath = join(root, "assets", "game-data.js");
const jsonPath = join(root, "assets", "game-data.json");

const versions = await fetchJson("https://ddragon.leagueoflegends.com/api/versions.json");
const version = versions[0];
const championData = await fetchJson(
  `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
);
const itemData = await fetchJson(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`);
const arenaData = await fetchJson("https://raw.communitydragon.org/latest/cdragon/arena/en_us.json");
const cherryAugmentData = await fetchJson(
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/cherry-augments.json",
);
const communityItemData = await fetchJson(
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json",
);

const champions = Object.values(championData.data)
  .map((champion) => champion.name)
  .sort((a, b) => a.localeCompare(b));

const championKeys = Object.fromEntries(
  Object.values(championData.data).flatMap((champion) => [
    [champion.id, champion.name],
    [String(champion.key), champion.name],
  ]),
);

const championAliases = Object.fromEntries(
  Object.values(championData.data).flatMap((champion) => [
    [normalizeKey(champion.name), champion.name],
    [normalizeKey(champion.id), champion.name],
  ]),
);

const championIcons = Object.fromEntries(
  Object.values(championData.data).map((champion) => [
    champion.name,
    `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
  ]),
);

const items = {};
const itemIcons = {};
const itemAliases = {};

Object.entries(itemData.data).forEach(([id, item]) => {
  addLookupItem(items, itemIcons, itemAliases, id, stripTags(item.name), `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`);
});

communityItemData.forEach((item) => {
  addLookupItem(items, itemIcons, itemAliases, item.id, stripTags(item.name), communityDragonAssetUrl(item.iconPath), {
    overwrite: false,
  });
});

const augments = {};
const augmentIcons = {};
const augmentAliases = {};

(arenaData.augments || []).forEach((augment) => {
  addLookupItem(
    augments,
    augmentIcons,
    augmentAliases,
    augment.id,
    stripTags(augment.name),
    communityDragonAssetUrl(augment.iconSmall || augment.iconLarge),
  );
});

cherryAugmentData.forEach((augment) => {
  addLookupItem(
    augments,
    augmentIcons,
    augmentAliases,
    augment.id,
    stripTags(augment.nameTRA || augment.simpleNameTRA || augment.augmentNameId),
    communityDragonAssetUrl(augment.augmentSmallIconPath),
  );
});

const payload = {
  version,
  generatedAt: new Date().toISOString(),
  sources: {
    dataDragonVersions: "https://ddragon.leagueoflegends.com/api/versions.json",
    champion: `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    item: `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`,
    arenaAugments: "https://raw.communitydragon.org/latest/cdragon/arena/en_us.json",
    cherryAugments:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/cherry-augments.json",
    communityItems:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json",
  },
  champions,
  championKeys,
  championAliases,
  championIcons,
  items,
  itemIcons,
  itemAliases,
  augments,
  augmentIcons,
  augmentAliases,
};

await writeFile(
  outPath,
  `window.ARENA_GAME_DATA = ${JSON.stringify(payload, null, 2)};\n`,
  "utf8",
);
await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  `Generated game data for Data Dragon ${version}: ${champions.length} champions, ${Object.keys(items).length} items, ${Object.keys(augments).length} augments.`,
);

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

function stripTags(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function addLookupItem(names, icons, aliases, id, name, icon, options = {}) {
  const key = String(id || "").trim();
  const label = stripTags(name);
  if (!key || !label) return;

  if (options.overwrite !== false || !names[key]) names[key] = label;
  if (icon && (options.overwrite !== false || !icons[key])) icons[key] = icon;
  aliases[normalizeKey(label)] = key;
}

function communityDragonAssetUrl(value) {
  const assetPath = String(value || "").trim();
  if (!assetPath) return "";
  const normalized = assetPath
    .replace(/^\/lol-game-data\/assets\//i, "")
    .replace(/^\/?assets\//i, "")
    .replace(/^\/+/, "")
    .toLowerCase();
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/${normalized}`;
}

function normalizeKey(value) {
  return stripTags(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}
