globalThis.ARENA_EXTERNAL_BUILDS = {
  lissandra: {
    champion: "Lissandra",
    source: "MetaSRC",
    sourceUrl: "https://www.metasrc.com/lol/arena/build/lissandra",
    patch: "26.13",
    tier: "B",
    top3Rate: "51.04%",
    avgPlacement: "3.49",
    pickRate: "7.88%",
    games: "28,416",
    updatedAt: "2026-07-02",
    notes: {
      pl: "Ręcznie wpisany podgląd builda zewnętrznego z MetaSRC. Dane aktualizujemy w tym pliku po patchu.",
      en: "Manually maintained external build preview. Update this file after patches.",
    },
    augments: {
      overall: [
        { id: "45", name: "Infernal Conduit", tier: "gold", rating: "S+", pickRate: "20%" },
        { id: "48", name: "Jeweled Gauntlet", tier: "prismatic", rating: "S+", pickRate: "18%" },
        { id: "30", name: "Eureka", tier: "prismatic", rating: "S+", pickRate: "15%" },
      ],
      silver: [
        { id: "97", name: "Witchful Thinking", tier: "silver", rating: "S+", pickRate: "11%" },
        { id: "205", name: "ADAPt", tier: "silver", rating: "S+", pickRate: "9%" },
        { id: "218", name: "Desecrator", tier: "silver", rating: "S+", pickRate: "8%" },
      ],
      gold: [
        { id: "65", name: "Phenomenal Evil", tier: "gold", rating: "S+", pickRate: "19%" },
        { id: "180", name: "Big Brain", tier: "gold", rating: "S+", pickRate: "11%" },
        { id: "133", name: "Magic Missile", tier: "gold", rating: "S+", pickRate: "10%" },
      ],
      prismatic: [
        { id: "48", name: "Jeweled Gauntlet", tier: "prismatic", rating: "S+", pickRate: "19%" },
        { id: "30", name: "Eureka", tier: "prismatic", rating: "S+", pickRate: "16%" },
        { id: "156", name: "Quest: Wooglet's Witchcap", tier: "prismatic", rating: "S+", pickRate: "13%" },
      ],
    },
    boots: [
      { id: "223020", name: "Sorcerer's Shoes", buyRate: "67%", games: "19K" },
      { id: "223158", name: "Ionian Boots of Lucidity", buyRate: "25%", games: "7.1K" },
      { id: "223009", name: "Boots of Swiftness", buyRate: "4%", games: "1K" },
    ],
    itemsByRound: [
      { round: "1", id: "223020", name: "Sorcerer's Shoes", buyRate: "67%" },
      { round: "2", id: "447109", name: "Cruelty", buyRate: "29%" },
      { round: "4", id: "223089", name: "Rabadon's Deathcap", buyRate: "79%" },
      { round: "6", id: "223157", name: "Zhonya's Hourglass", buyRate: "38%" },
      { round: "9", id: "664011", name: "Sword of Blossoming Dawn", buyRate: "9%" },
      { round: "11", id: "226616", name: "Staff of Flowing Water", buyRate: "8%" },
    ],
    prismaticItems: [
      { id: "447109", name: "Cruelty", rating: "S+", pickRate: "29%" },
      { id: "443062", name: "Sanguine Gift", rating: "S+", pickRate: "25%" },
      { id: "447108", name: "Runecarver", rating: "S+", pickRate: "17%" },
      { id: "447106", name: "Dragonheart", rating: "S+", pickRate: "11%" },
      { id: "447104", name: "Innervating Locket", rating: "S", pickRate: "8%" },
    ],
    roundOptions: {
      "4": [
        { id: "223089", name: "Rabadon's Deathcap", buyRate: "77%" },
        { id: "223157", name: "Zhonya's Hourglass", buyRate: "44%" },
        { id: "443062", name: "Sanguine Gift", buyRate: "14%" },
      ],
      "6": [
        { id: "223157", name: "Zhonya's Hourglass", buyRate: "44%" },
        { id: "224645", name: "Shadowflame", buyRate: "34%" },
        { id: "223089", name: "Rabadon's Deathcap", buyRate: "77%" },
      ],
      "9": [
        { id: "443062", name: "Sanguine Gift", buyRate: "6%" },
        { id: "224645", name: "Shadowflame", buyRate: "6%" },
        { id: "223158", name: "Ionian Boots of Lucidity", buyRate: "5%" },
      ],
    },
  },
};
