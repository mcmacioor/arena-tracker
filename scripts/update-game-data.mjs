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

const champions = Object.values(championData.data)
  .map((champion) => champion.name)
  .sort((a, b) => a.localeCompare(b));

const championIcons = Object.fromEntries(
  Object.values(championData.data).map((champion) => [
    champion.name,
    `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
  ]),
);

const items = Object.fromEntries(
  Object.entries(itemData.data).map(([id, item]) => [id, stripTags(item.name)]),
);

const augments = Object.fromEntries(
  (arenaData.augments || []).map((augment) => [String(augment.id), stripTags(augment.name)]),
);

const payload = {
  version,
  generatedAt: new Date().toISOString(),
  sources: {
    dataDragonVersions: "https://ddragon.leagueoflegends.com/api/versions.json",
    champion: `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    item: `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`,
    arenaAugments: "https://raw.communitydragon.org/latest/cdragon/arena/en_us.json",
  },
  champions,
  championIcons,
  items,
  augments,
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
