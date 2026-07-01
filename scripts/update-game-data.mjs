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
const itemDataPl = await fetchJson(`https://ddragon.leagueoflegends.com/cdn/${version}/data/pl_PL/item.json`);
const arenaData = await fetchJson("https://raw.communitydragon.org/latest/cdragon/arena/en_us.json");
const arenaDataPl = await fetchJson("https://raw.communitydragon.org/latest/cdragon/arena/pl_pl.json");
const cherryAugmentData = await fetchJson(
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/cherry-augments.json",
);
const cherryAugmentDataPl = await fetchJson(
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/pl_pl/v1/cherry-augments.json",
);
const communityItemData = await fetchJson(
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json",
);
const communityItemDataPl = await fetchJson(
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/pl_pl/v1/items.json",
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
const itemDetails = {};
const itemDataPlById = mapById(Object.entries(itemDataPl.data).map(([id, item]) => ({ ...item, id })));
const communityItemPlById = mapById(communityItemDataPl);

Object.entries(itemData.data).forEach(([id, item]) => {
  const pl = itemDataPlById.get(String(id));
  addAsset(items, itemIcons, itemAliases, itemDetails, {
    id,
    names: { en: stripTags(item.name), pl: stripTags(pl?.name) },
    descriptions: { en: stripTags(item.description), pl: stripTags(pl?.description) },
    icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image.full}`,
    price: Number(item.gold?.total || 0),
    tier: itemTier(id, item),
    categories: item.tags || [],
  });
});

communityItemData.forEach((item) => {
  const pl = communityItemPlById.get(String(item.id));
  addAsset(items, itemIcons, itemAliases, itemDetails, {
    id: item.id,
    names: { en: stripTags(item.name), pl: stripTags(pl?.name) },
    descriptions: { en: stripTags(item.description), pl: stripTags(pl?.description) },
    icon: communityDragonAssetUrl(item.iconPath),
    price: Number(item.priceTotal || item.price || 0),
    tier: itemTier(item.id, item),
    categories: item.categories || [],
    overwrite: false,
  });
});

const augments = {};
const augmentIcons = {};
const augmentAliases = {};
const augmentDetails = {};
const arenaAugmentPlById = mapById(arenaDataPl.augments || []);
const cherryAugmentPlById = mapById(cherryAugmentDataPl);

(arenaData.augments || []).forEach((augment) => {
  const pl = arenaAugmentPlById.get(String(augment.id));
  addAsset(augments, augmentIcons, augmentAliases, augmentDetails, {
    id: augment.id,
    names: { en: stripTags(augment.name), pl: stripTags(pl?.name) },
    descriptions: {
      en: formatDescription(augment.tooltip || augment.desc, augment.dataValues),
      pl: formatDescription(pl?.tooltip || pl?.desc, pl?.dataValues || augment.dataValues),
    },
    icon: communityDragonAssetUrl(augment.iconSmall || augment.iconLarge),
    tier: augmentTier(augment.rarity),
    rarity: augment.rarity,
  });
});

cherryAugmentData.forEach((augment) => {
  const pl = cherryAugmentPlById.get(String(augment.id));
  addAsset(augments, augmentIcons, augmentAliases, augmentDetails, {
    id: augment.id,
    names: {
      en: stripTags(augment.nameTRA || augment.simpleNameTRA || augment.augmentNameId),
      pl: stripTags(pl?.nameTRA || pl?.simpleNameTRA),
    },
    icon: communityDragonAssetUrl(augment.augmentSmallIconPath),
    tier: augmentTier(augment.rarity),
    rarity: augment.rarity,
    overwrite: false,
  });
});

const payload = {
  version,
  generatedAt: new Date().toISOString(),
  sources: {
    dataDragonVersions: "https://ddragon.leagueoflegends.com/api/versions.json",
    champion: `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    item: `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`,
    itemPl: `https://ddragon.leagueoflegends.com/cdn/${version}/data/pl_PL/item.json`,
    arenaAugments: "https://raw.communitydragon.org/latest/cdragon/arena/en_us.json",
    arenaAugmentsPl: "https://raw.communitydragon.org/latest/cdragon/arena/pl_pl.json",
    cherryAugments:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/cherry-augments.json",
    cherryAugmentsPl:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/pl_pl/v1/cherry-augments.json",
    communityItems:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json",
    communityItemsPl:
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/pl_pl/v1/items.json",
  },
  champions,
  championKeys,
  championAliases,
  championIcons,
  items,
  itemIcons,
  itemAliases,
  itemDetails,
  augments,
  augmentIcons,
  augmentAliases,
  augmentDetails,
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
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(stats|passive|active|mainText|rules|flavorText)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/{{[^{}]+}}/g, " ")
    .replace(/%i:[^%\s]+%/g, " ")
    .replace(/@[A-Za-z0-9_.:]+(?:\*-?[0-9.]+)?@/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s+([.,;:!?])/g, "$1")
    .split("\n")
    .map((line) =>
      line
        .replace(/^\+\s+(?!\d)/, "")
        .replace(/\(\s*\)/g, "")
        .replace(/\bzadaje pkt\. obra\u017ce\u0144/gi, "zadaje obra\u017cenia")
        .replace(/:\s*(pkt\.?|points?)$/i, "")
        .replace(/\s+([.,;:!?])/g, "$1")
        .trim(),
    )
    .filter((line) => line && !/^[.,;:!?-]+$/.test(line))
    .filter((line) => !/^(damage dealt|total damage|healing this round|total healing|obra\u017cenia zadane|ca\u0142kowite zadane obra\u017cenia|leczenie w tej rundzie|ca\u0142kowite leczenie)/i.test(line))
    .join("\n")
    .trim();
}

function formatDescription(value, dataValues = {}) {
  return stripTags(interpolateVariables(value, dataValues));
}

function interpolateVariables(value, dataValues = {}) {
  return String(value || "").replace(/@([A-Za-z0-9_.:]+)(?:\*(-?[0-9.]+))?@/g, (_match, key, multiplier) => {
    const keyOptions = [key, key.split(":").pop(), key.split(".").pop()].filter(Boolean);
    const value = keyOptions.map((option) => dataValues?.[option]).find((item) => item !== undefined);
    const values = Array.isArray(value) ? value : [value];
    const numeric = values
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item));
    if (!numeric.length) return "";

    const scale = Number(multiplier || 1);
    const scaled = numeric.map((item) => item * scale);
    const min = Math.min(...scaled);
    const max = Math.max(...scaled);
    return nearlyEqual(min, max) ? formatNumber(min) : `${formatNumber(min)} - ${formatNumber(max)}`;
  });
}

function nearlyEqual(left, right) {
  return Math.abs(left - right) < 0.005;
}

function formatNumber(value) {
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 0.005) return String(rounded);
  return value.toFixed(1).replace(/\.0$/, "");
}

function addAsset(names, icons, aliases, details, asset) {
  const options = asset || {};
  const key = String(asset.id || "").trim();
  const label = stripTags(asset.names?.en || asset.name);
  if (!key || !label) return;

  const existing = details[key] || {};
  const next = {
    ...existing,
    id: key,
    names: {
      ...(existing.names || {}),
      en: label,
      ...(asset.names?.pl ? { pl: stripTags(asset.names.pl) } : {}),
    },
    descriptions: {
      ...(existing.descriptions || {}),
      ...(asset.descriptions?.en ? { en: stripTags(asset.descriptions.en) } : {}),
      ...(asset.descriptions?.pl ? { pl: stripTags(asset.descriptions.pl) } : {}),
    },
    icon: asset.icon || existing.icon || "",
    tier: asset.tier || existing.tier || "",
    rarity: asset.rarity ?? existing.rarity,
    price: Number(asset.price || existing.price || 0),
    categories: asset.categories || existing.categories || [],
  };

  if (options.overwrite !== false || !names[key]) names[key] = next.names.en;
  if (next.icon && (options.overwrite !== false || !icons[key])) icons[key] = next.icon;
  details[key] = options.overwrite === false ? { ...next, ...existing, names: { ...next.names, ...(existing.names || {}) } } : next;
  aliases[normalizeKey(next.names.en)] = key;
  if (next.names.pl) aliases[normalizeKey(next.names.pl)] = key;
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

function mapById(values) {
  return new Map((values || []).map((item) => [String(item.id), item]));
}

function augmentTier(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("silver") || value === 0) return "silver";
  if (text.includes("gold") || value === 1) return "gold";
  if (text.includes("prismatic") || value === 2) return "prismatic";
  if (value === 4) return "special";
  return "";
}

function itemTier(id, item = {}) {
  const key = String(id || "");
  const categories = item.categories || item.tags || [];
  if (categories.includes("Trinket")) return "trinket";
  if (key.startsWith("44") && Number(item.priceTotal || item.gold?.total || item.price || 0) >= 2500) return "prismatic";
  if (categories.includes("Boots")) return "boots";
  return "";
}

function normalizeKey(value) {
  return stripTags(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}
