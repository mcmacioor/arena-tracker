const http = require("node:http");
const { createHash, randomBytes, scryptSync, timingSafeEqual } = require("node:crypto");
const { existsSync, readFileSync } = require("node:fs");
const { mkdir, readFile, rename, writeFile, stat } = require("node:fs/promises");
const path = require("node:path");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "arenatracker-db.json");
const RESET_OUTBOX_PATH = path.join(DATA_DIR, "password-reset-outbox.json");
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "127.0.0.1";
const SESSION_COOKIE = "arena_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const MAX_BODY_BYTES = 1_000_000;
const ARENA_QUEUE_IDS = [1750];
const ARENA_MAX_PLACEMENT = 6;
const RIOT_SYNC_DEFAULT_LIMIT = 80;
const RIOT_SYNC_MAX_LIMIT = 500;
const PUBLIC_PROFILE_MATCH_LIMIT = RIOT_SYNC_MAX_LIMIT;
const PUBLIC_PROFILE_FETCH_BATCH = RIOT_SYNC_DEFAULT_LIMIT;
const PUBLIC_PROFILE_CACHE_TTL_MS = 60 * 60 * 1000;
const RIOT_FETCH_TIMEOUT_MS = 20_000;
const RIOT_MATCH_DETAIL_CONCURRENCY = 4;
const DEFAULT_ROUTING = "europe";
const ROUTINGS = new Set(["americas", "asia", "europe", "sea"]);
const REGIONS = new Set([
  "br1",
  "eun1",
  "euw1",
  "jp1",
  "kr",
  "la1",
  "la2",
  "me1",
  "na1",
  "oc1",
  "ru",
  "sg2",
  "tr1",
  "tw2",
  "vn2",
]);
let dbWriteQueue = Promise.resolve();
const PUBLIC_REGION_ALIASES = new Map([
  ["br", "br1"],
  ["eune", "eun1"],
  ["euw", "euw1"],
  ["jp", "jp1"],
  ["lan", "la1"],
  ["las", "la2"],
  ["na", "na1"],
  ["oce", "oc1"],
  ["tr", "tr1"],
]);

const sessions = new Map();
const syncJobs = new Map();
const publicSyncJobs = new Map();
const SYNC_JOB_TTL_MS = 10 * 60 * 1000;

function getSyncJob(store, jobId, options) {
  const job = jobId ? store.get(jobId) : null;
  if (!job) return null;
  if (job.expiresAt < Date.now()) {
    store.delete(job.id);
    return null;
  }
  if (job.ownerId !== options.ownerId || job.scope !== options.scope || job.limit !== options.limit) return null;
  return job;
}

function createSyncJob(store, payload) {
  const job = {
    id: makeId("sync"),
    ...payload,
    remainingIds: [...(payload.remainingIds || [])],
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + SYNC_JOB_TTL_MS,
  };
  store.set(job.id, job);
  return job;
}

loadEnvFile();
const GAME_DATA = loadGameData();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

    if (url.pathname.startsWith("/api/")) {
      await routeApi(req, res, url);
      return;
    }

    await serveStatic(req, res, url);
  } catch (error) {
    console.error(error);
    sendJson(res, error.status || 500, {
      error: error.status ? error.message : "Internal server error",
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`ArenaTracker listening on http://${HOST}:${PORT}/`);
});

async function routeApi(req, res, url) {
  const method = req.method.toUpperCase();

  if (method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      riotApiKey: Boolean(process.env.RIOT_API_KEY),
      dataDragonVersion: GAME_DATA.version || null,
      championCount: GAME_DATA.champions?.length || 0,
      arenaQueueIds: ARENA_QUEUE_IDS,
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/auth/register") {
    await register(req, res);
    return;
  }

  if (method === "POST" && url.pathname === "/api/auth/login") {
    await login(req, res);
    return;
  }

  if (method === "POST" && url.pathname === "/api/auth/logout") {
    logout(req, res);
    return;
  }

  if (method === "POST" && url.pathname === "/api/auth/request-password-reset") {
    await requestPasswordReset(req, res);
    return;
  }

  if (method === "POST" && url.pathname === "/api/auth/reset-password") {
    await resetPassword(req, res);
    return;
  }

  if (method === "GET" && url.pathname === "/api/auth/me") {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    sendJson(res, 200, { user: publicUser(auth.user) });
    return;
  }

  if (method === "GET" && url.pathname === "/api/public-profile") {
    await getPublicProfile(req, res, url);
    return;
  }

  if (method === "GET" && url.pathname === "/api/matches") {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const db = await readDb();
    const matches = db.matches
      .filter((match) => match.userId === auth.user.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    sendJson(res, 200, { matches });
    return;
  }

  if (method === "POST" && url.pathname === "/api/matches") {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const body = await readJsonBody(req);
    const match = normalizeMatch(body, auth.user.id, "manual");
    await mutateDb((db) => {
      db.matches.unshift(match);
    });
    sendJson(res, 201, { match });
    return;
  }

  if (method === "POST" && url.pathname === "/api/matches/import") {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const body = await readJsonBody(req);
    const imported = Array.isArray(body.matches) ? body.matches : [];
    const mode = body.mode === "replace" ? "replace" : "merge";
    const matches = imported.map((match) => normalizeMatch(match, auth.user.id, match.source?.type || "manual"));

    await mutateDb((db) => {
      if (mode === "replace") {
        db.matches = db.matches.filter((match) => match.userId !== auth.user.id);
      }
      const existingKeys = new Set(db.matches.map(matchDedupeKey));
      matches.forEach((match) => {
        const key = matchDedupeKey(match);
        if (!existingKeys.has(key)) {
          db.matches.unshift(match);
          existingKeys.add(key);
        }
      });
    });

    const db = await readDb();
    sendJson(res, 200, {
      matches: db.matches.filter((match) => match.userId === auth.user.id),
    });
    return;
  }

  const matchDelete = url.pathname.match(/^\/api\/matches\/([^/]+)$/);
  if (method === "DELETE" && matchDelete) {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const id = decodeURIComponent(matchDelete[1]);
    let removed = false;
    await mutateDb((db) => {
      const before = db.matches.length;
      db.matches = db.matches.filter((match) => !(match.userId === auth.user.id && match.id === id));
      removed = db.matches.length !== before;
    });
    sendJson(res, removed ? 200 : 404, { ok: removed });
    return;
  }

  if (method === "GET" && url.pathname === "/api/riot/status") {
    sendJson(res, 200, {
      riotApiKey: Boolean(process.env.RIOT_API_KEY),
      arenaQueueIds: ARENA_QUEUE_IDS,
      routings: [...ROUTINGS],
      regions: [...REGIONS],
    });
    return;
  }

  if (method === "GET" && url.pathname === "/api/riot/search") {
    await searchRiotProfiles(req, res, url);
    return;
  }

  if (method === "POST" && url.pathname === "/api/riot/profile") {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    await saveRiotProfile(req, res, auth.user);
    return;
  }

  if (method === "POST" && url.pathname === "/api/riot/sync") {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    await syncRiotMatches(req, res, auth.user);
    return;
  }

  sendJson(res, 404, { error: "Not found" });
}

async function register(req, res) {
  const body = await readJsonBody(req);
  const email = cleanText(body.email).toLowerCase();
  const displayName = cleanText(body.displayName) || email.split("@")[0];
  const password = String(body.password || "");

  if (!email.includes("@") || password.length < 6) {
    sendJson(res, 400, { error: "Podaj email i hasło o długości co najmniej 6 znaków." });
    return;
  }

  let createdUser;
  await mutateDb((db) => {
    if (db.users.some((user) => user.email === email)) {
      const error = new Error("Konto z tym emailem już istnieje.");
      error.status = 409;
      throw error;
    }

    createdUser = {
      id: makeId("user"),
      email,
      displayName,
      passwordHash: hashPassword(password),
      riotProfile: null,
      createdAt: new Date().toISOString(),
    };
    db.users.push(createdUser);
  });

  setSession(res, createdUser.id);
  sendJson(res, 201, { user: publicUser(createdUser) });
}

async function login(req, res) {
  const body = await readJsonBody(req);
  const email = cleanText(body.email).toLowerCase();
  const password = String(body.password || "");
  const db = await readDb();
  const user = db.users.find((item) => item.email === email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    sendJson(res, 401, { error: "Nieprawidłowy email albo hasło." });
    return;
  }

  setSession(res, user.id);
  sendJson(res, 200, { user: publicUser(user) });
}

function logout(req, res) {
  const token = parseCookies(req.headers.cookie || "")[SESSION_COOKIE];
  if (token) sessions.delete(token);
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  sendJson(res, 200, { ok: true });
}

async function requestPasswordReset(req, res) {
  const body = await readJsonBody(req);
  const email = cleanText(body.email).toLowerCase();

  if (!email.includes("@")) {
    sendJson(res, 400, { error: "Podaj email użyty przy rejestracji." });
    return;
  }

  let resetUrl = "";
  await mutateDb((db) => {
    const user = db.users.find((item) => item.email === email);
    if (!user) return;

    const token = randomBytes(32).toString("base64url");
    user.passwordReset = {
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString(),
      requestedAt: new Date().toISOString(),
    };
    resetUrl = `http://${HOST}:${PORT}/#reset-password/${encodeURIComponent(token)}`;
  });

  if (resetUrl) {
    await writeResetOutboxMessage({
      to: email,
      subject: "ArenaTracker password reset",
      resetUrl,
      createdAt: new Date().toISOString(),
    });
  }

  sendJson(res, 200, {
    ok: true,
    resetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl,
  });
}

async function resetPassword(req, res) {
  const body = await readJsonBody(req);
  const token = cleanText(body.token);
  const password = String(body.password || "");

  if (!token || password.length < 6) {
    sendJson(res, 400, { error: "Link resetujący jest nieprawidłowy albo hasło jest za krótkie." });
    return;
  }

  const tokenHash = hashToken(token);
  let updated = false;
  await mutateDb((db) => {
    const user = db.users.find((item) => {
      const reset = item.passwordReset;
      return reset?.tokenHash === tokenHash && new Date(reset.expiresAt).getTime() > Date.now();
    });
    if (!user) return;
    user.passwordHash = hashPassword(password);
    user.passwordReset = null;
    user.passwordResetAt = new Date().toISOString();
    updated = true;
  });

  if (!updated) {
    sendJson(res, 400, { error: "Link resetujący wygasł albo jest nieprawidłowy." });
    return;
  }
  sendJson(res, 200, { ok: true });
}

async function saveRiotProfile(req, res, user) {
  const body = await readJsonBody(req);
  const profile = normalizeRiotProfile(body);
  let account = null;
  let summoner = null;

  if (process.env.RIOT_API_KEY) {
    account = await fetchRiotAccount(profile);
    summoner = await fetchSummonerByPuuid(profile.region, account.puuid).catch(() => null);
    profile.puuid = account.puuid;
  }

  await mutateDb((db) => {
    const stored = db.users.find((item) => item.id === user.id);
    stored.riotProfile = {
      ...profile,
      profileIconId: summoner?.profileIconId || null,
      verifiedAt: account ? new Date().toISOString() : null,
    };
  });

  const db = await readDb();
  sendJson(res, 200, { user: publicUser(db.users.find((item) => item.id === user.id)) });
}

async function getPublicProfile(req, res, url) {
  const region = normalizePublicRegion(url.searchParams.get("region"));
  const slug = cleanText(url.searchParams.get("slug"));
  const forceRefresh = url.searchParams.get("refresh") === "1";
  const limit = clamp(Number(url.searchParams.get("limit") || PUBLIC_PROFILE_MATCH_LIMIT), 1, RIOT_SYNC_MAX_LIMIT);
  const batch = clamp(Number(url.searchParams.get("batch") || PUBLIC_PROFILE_FETCH_BATCH), 1, limit);
  const syncJobId = cleanText(url.searchParams.get("syncJobId"));

  if (!region || !slug) {
    sendJson(res, 400, { error: "Brakuje regionu albo nazwy profilu." });
    return;
  }

  const db = await readDb();
  const user = db.users.find((item) => {
    const profile = item.riotProfile;
    if (!profile?.gameName || !profile?.tagLine) return false;
    return normalizePublicRegion(profile.region) === region && normalizeSlug(publicProfileSlug(profile)) === normalizeSlug(slug);
  });

  if (user && forceRefresh) {
    const cached = findCachedPublicProfile(db, region, slug);
    const fetched = await fetchRiotPublicProfile(region, slug, { existing: cached, limit, batch, syncJobId }).catch(() => null);
    if (fetched) {
      await savePublicProfileCache(fetched);
      sendJson(res, 200, buildPublicProfile(fetched, fetched.matches));
      return;
    }
  }

  if (!user) {
    const cached = findCachedPublicProfile(db, region, slug);
    const shouldRefresh = forceRefresh || !cached || isPublicProfileCacheStale(cached);

    if (!shouldRefresh && cached) {
      sendJson(res, 200, buildPublicProfile(cached, cached.matches || []));
      return;
    }

    const fetched = await fetchRiotPublicProfile(region, slug, { existing: cached, limit, batch, syncJobId }).catch(() => null);
    if (fetched) {
      await savePublicProfileCache(fetched);
      sendJson(res, 200, buildPublicProfile(fetched, fetched.matches));
      return;
    }

    if (cached) {
      sendJson(res, 200, buildPublicProfile(cached, cached.matches || []));
      return;
    }

    sendJson(res, 404, { error: "Nie znaleziono publicznego profilu." });
    return;
  }

  const matches = db.matches
    .filter((match) => match.userId === user.id)
    .map((match) => normalizeMatch(match, user.id, match.source?.type || "riot"))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  sendJson(res, 200, buildPublicProfile(user, matches));
}

async function searchRiotProfiles(req, res, url) {
  const query = cleanText(url.searchParams.get("q"));
  const region = normalizePublicRegion(url.searchParams.get("region")) || "euw1";
  if (query.length < 1) {
    sendJson(res, 200, { results: [] });
    return;
  }

  const db = await readDb();
  const normalizedQuery = normalizeSlug(query.replace("#", "-"));
  const results = [];
  const seen = new Set();
  const addResult = (result, options = {}) => {
    const key = normalizeSlug(result.slug);
    if (!key || seen.has(key)) return;
    seen.add(key);
    if (options.prepend) results.unshift(result);
    else results.push(result);
  };
  db.users.forEach((user) => {
    const profile = user.riotProfile;
    if (!profile?.gameName || !profile?.tagLine) return;
    if (normalizePublicRegion(profile.region) !== region) return;
    const slug = publicProfileSlug(profile);
    const haystack = normalizeSlug(`${profile.gameName} ${profile.tagLine} ${slug}`);
    if (!haystack.includes(normalizedQuery)) return;
    addResult(searchResultFromProfile(profile, "ArenaTracker"));
  });
  db.publicProfiles.forEach((publicProfile) => {
    const profile = publicProfile.riotProfile;
    if (!profile?.gameName || !profile?.tagLine) return;
    if (normalizePublicRegion(profile.region) !== region) return;
    const slug = publicProfileSlug(profile);
    const haystack = normalizeSlug(`${profile.gameName} ${profile.tagLine} ${slug}`);
    if (!haystack.includes(normalizedQuery)) return;
    addResult(searchResultFromProfile(profile, "Riot cache"));
  });

  const userRegionById = new Map(
    db.users.map((user) => [user.id, normalizePublicRegion(user.riotProfile?.region)]),
  );
  db.matches.forEach((match) => {
    const matchRegion = normalizePublicRegion(match.source?.region || userRegionById.get(match.userId) || region);
    if (matchRegion !== region) return;
    const participants = [
      ...(Array.isArray(match.players) ? match.players : []),
      ...(Array.isArray(match.teammates) ? match.teammates : []),
    ];
    participants.forEach((participant) => {
      const parsed = parseRiotIdQuery(participant.riotId);
      if (!parsed) return;
      const slug = publicProfileSlug(parsed);
      const haystack = normalizeSlug(`${parsed.gameName} ${parsed.tagLine} ${slug}`);
      if (!haystack.includes(normalizedQuery)) return;
      addResult(searchResultFromRiotId(parsed, region, "historia meczów", GAME_DATA.championIcons?.[participant.champion]));
    });
  });

  const exact = parseRiotIdQuery(query);
  if (exact && process.env.RIOT_API_KEY) {
    try {
      const routing = routingForRegion(region);
      const account = await fetchRiotAccount({ ...exact, routing });
      const summoner = await fetchSummonerByPuuid(region, account.puuid).catch(() => null);
      const result = searchResultFromProfile(
        {
          gameName: account.gameName || exact.gameName,
          tagLine: account.tagLine || exact.tagLine,
          region,
          profileIconId: summoner?.profileIconId || null,
        },
        "Riot",
      );
      addResult(result, { prepend: true });
    } catch {
      // Exact Riot lookup is optional; local indexed profiles still work.
    }
  }

  sendJson(res, 200, { results: results.slice(0, 8) });
}

async function fetchRiotPublicProfile(region, slug, options = {}) {
  if (!process.env.RIOT_API_KEY) return null;
  const parsed = parsePublicProfileSlug(slug);
  if (!parsed) return null;
  const limit = clamp(Number(options.limit || PUBLIC_PROFILE_MATCH_LIMIT), 1, RIOT_SYNC_MAX_LIMIT);
  const batch = clamp(Number(options.batch || PUBLIC_PROFILE_FETCH_BATCH), 1, limit);
  const existing = options.existing || null;
  const routing = routingForRegion(region);
  const cacheId = publicProfileCacheId(region, slug);
  let job = getSyncJob(publicSyncJobs, options.syncJobId, { ownerId: cacheId, scope: "public", limit });
  let account;
  let summoner;
  let matchIds;

  if (job) {
    account = job.account;
    summoner = job.summoner;
    matchIds = job.matchIds;
  } else {
    account = await fetchRiotAccount({ ...parsed, routing });
    summoner = await fetchSummonerByPuuid(region, account.puuid).catch(() => null);
    matchIds = await fetchArenaMatchIds(account, routing, limit, {
      startTime: seasonStartTimestamp(),
    });
  }
  const existingMatches = Array.isArray(existing?.matches)
    ? existing.matches.map((match) => normalizeMatch(match, "public", "riot"))
    : [];
  const existingByMatchId = new Map(
    existingMatches
      .filter((match) => match.source?.matchId && Array.isArray(match.players) && match.players.length)
      .map((match) => [match.source.matchId, match]),
  );
  if (!job) {
    const idsToFetch = [];
    matchIds.forEach((matchId) => {
      if (!existingByMatchId.has(matchId)) idsToFetch.push(matchId);
    });
    job = createSyncJob(publicSyncJobs, {
      ownerId: cacheId,
      scope: "public",
      limit,
      account,
      summoner,
      matchIds,
      remainingIds: idsToFetch,
    });
  }

  const idsToFetchNow = job.remainingIds.slice(0, batch);
  job.remainingIds = job.remainingIds.slice(idsToFetchNow.length);
  job.expiresAt = Date.now() + SYNC_JOB_TTL_MS;
  const pendingCount = job.remainingIds.length;
  const details = await fetchMatchDetails(routing, idsToFetchNow);
  const profile = {
    gameName: account.gameName || parsed.gameName,
    tagLine: account.tagLine || parsed.tagLine,
    routing,
    region,
    puuid: account.puuid,
    profileIconId: summoner?.profileIconId || null,
    lastSyncedAt: pendingCount ? existing?.riotProfile?.lastSyncedAt || null : new Date().toISOString(),
    lastSyncAttemptAt: new Date().toISOString(),
  };
  const importedMatches = details
    .map((detail) => mapRiotMatch(detail, account.puuid, "public"))
    .filter(Boolean);
  const matchIdSet = new Set(matchIds);
  const seasonExistingMatches = existingMatches.filter((match) => matchIdSet.has(match.source?.matchId));
  const matches = mergeMatchesByKey([...importedMatches, ...seasonExistingMatches])
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!pendingCount) publicSyncJobs.delete(job.id);
  return {
    id: publicProfileCacheId(profile.region, publicProfileSlug(profile)),
    riotProfile: profile,
    matches,
    sync: {
      jobId: pendingCount ? job.id : "",
      scannedCount: details.length,
      reusedCount: seasonExistingMatches.length,
      pendingCount,
      totalRiotMatchCount: matchIds.length,
      hasMore: pendingCount > 0,
    },
    updatedAt: profile.lastSyncAttemptAt,
  };
}

function findCachedPublicProfile(db, region, slug) {
  const id = publicProfileCacheId(region, slug);
  return db.publicProfiles.find((profile) => profile.id === id);
}

function isPublicProfileCacheStale(profile) {
  const updatedAt = Date.parse(profile.updatedAt || profile.riotProfile?.lastSyncedAt || "");
  return !updatedAt || Date.now() - updatedAt > PUBLIC_PROFILE_CACHE_TTL_MS;
}

async function savePublicProfileCache(profile) {
  await mutateDb((db) => {
    const id = publicProfileCacheId(profile.riotProfile.region, publicProfileSlug(profile.riotProfile));
    const stored = {
      ...profile,
      id,
      updatedAt: profile.updatedAt || new Date().toISOString(),
    };
    const index = db.publicProfiles.findIndex((item) => item.id === id);
    if (index >= 0) db.publicProfiles[index] = stored;
    else db.publicProfiles.unshift(stored);
  });
}

function publicProfileCacheId(region, slug) {
  return `${normalizePublicRegion(region)}:${normalizeSlug(slug)}`;
}

function mergeMatchesByKey(matches) {
  const merged = new Map();
  matches.forEach((match) => {
    const key = matchDedupeKey(match);
    if (!key || merged.has(key)) return;
    merged.set(key, match);
  });
  return [...merged.values()];
}

function searchResultFromProfile(profile, source) {
  return {
    gameName: profile.gameName,
    tagLine: profile.tagLine,
    region: profile.region,
    slug: publicProfileSlug(profile),
    publicPath: `/${publicRegionSlug(profile.region)}/${encodeURIComponent(publicProfileSlug(profile))}`,
    profileIconUrl: profileIconUrl(profile.profileIconId),
    caption: source,
  };
}

function searchResultFromRiotId(parsed, region, source, iconUrl = "") {
  const profile = {
    gameName: parsed.gameName,
    tagLine: parsed.tagLine,
    region,
  };
  const slug = publicProfileSlug(profile);
  return {
    gameName: profile.gameName,
    tagLine: profile.tagLine,
    region,
    slug,
    publicPath: `/${publicRegionSlug(region)}/${encodeURIComponent(slug)}`,
    profileIconUrl: cleanText(iconUrl),
    caption: source,
  };
}

function buildPublicProfile(user, matches) {
  const championStats = getChampionStatsForMatches(matches);
  const wonChampions = championStats
    .filter((stat) => stat.wins > 0)
    .sort((a, b) => a.champion.localeCompare(b.champion));
  const profile = user.riotProfile;

  return {
    profile: {
      gameName: profile.gameName,
      tagLine: profile.tagLine,
      region: profile.region,
      slug: publicProfileSlug(profile),
      profileIconUrl: profileIconUrl(profile.profileIconId),
      lastSyncedAt: profile.lastSyncedAt || user.updatedAt || null,
    },
    progress: {
      won: wonChampions.length,
      total: GAME_DATA.champions?.length || 0,
    },
    sync: user.sync || null,
    wonChampions: wonChampions.map((stat) => ({
      champion: stat.champion,
      wins: stat.wins,
      games: stat.games,
      averagePlacement: stat.avg,
      icon: GAME_DATA.championIcons?.[stat.champion] || "",
    })),
    matches: matches.slice(0, 80).map(publicMatchSummary),
    topDuo: getPartnerStatsForMatches(matches).slice(0, 8),
  };
}

function publicMatchSummary(match) {
  return {
    id: match.id,
    date: match.date,
    playedAt: match.playedAt,
    patch: match.patch,
    champion: match.champion,
    partner: match.partner,
    teammates: Array.isArray(match.teammates)
      ? match.teammates.map((teammate) => ({
          champion: teammate.champion,
          riotId: teammate.riotId,
          placement: teammate.placement,
        }))
      : [],
    players: Array.isArray(match.players)
      ? match.players.map((player) => ({
          champion: player.champion,
          riotId: player.riotId,
          placement: player.placement,
          teamId: player.teamId,
          augments: player.augments || [],
          items: player.items || [],
        }))
      : [],
    placement: match.placement,
    augments: match.augments || [],
    items: match.items || [],
  };
}

function getChampionStatsForMatches(matches) {
  const grouped = new Map();

  matches.forEach((match) => {
    const champion = canonicalChampionName(match.champion);
    if (!champion) return;
    if (!grouped.has(champion)) {
      grouped.set(champion, {
        champion,
        games: 0,
        wins: 0,
        placements: [],
      });
    }
    const stat = grouped.get(champion);
    stat.games += 1;
    stat.placements.push(match.placement);
    if (match.placement === 1) stat.wins += 1;
  });

  return [...grouped.values()].map((stat) => ({
    ...stat,
    avg: average(stat.placements),
  }));
}

function getPartnerStatsForMatches(matches) {
  const partners = new Map();

  matches.forEach((match) => {
    const labels = getPartnerLabels(match, { preferPlayers: true });
    labels.forEach((name) => {
      if (!partners.has(name)) partners.set(name, { name, games: 0, wins: 0, placements: [] });
      const stat = partners.get(name);
      stat.games += 1;
      stat.placements.push(match.placement);
      if (match.placement === 1) stat.wins += 1;
    });
  });

  return [...partners.values()]
    .map((stat) => ({
      ...stat,
      winrate: stat.games ? stat.wins / stat.games : 0,
      averagePlacement: average(stat.placements),
    }))
    .sort((a, b) => b.games - a.games || a.averagePlacement - b.averagePlacement || a.name.localeCompare(b.name));
}

async function syncRiotMatches(req, res, user) {
  if (!process.env.RIOT_API_KEY) {
    sendJson(res, 400, {
      error: "Brakuje RIOT_API_KEY. Ustaw zmienną środowiskową i uruchom serwer ponownie.",
    });
    return;
  }

  const body = await readJsonBody(req);
  const limit = clamp(Number(body.limit || RIOT_SYNC_DEFAULT_LIMIT), 1, RIOT_SYNC_MAX_LIMIT);
  const scope = body.scope === "season" ? "season" : "recent";
  const batch = clamp(Number(body.batch || limit), 1, limit);
  const syncJobId = cleanText(body.syncJobId);
  const profile = user.riotProfile;

  if (!profile?.gameName || !profile?.tagLine) {
    sendJson(res, 400, { error: "Najpierw zapisz konto League w profilu." });
    return;
  }

  const existingDb = await readDb();
  let job = getSyncJob(syncJobs, syncJobId, { ownerId: user.id, scope, limit });
  let account;
  let summoner;
  let matchIds;

  if (job) {
    account = job.account;
    summoner = job.summoner;
    matchIds = job.matchIds;
  } else {
    account = profile.puuid ? profile : await fetchRiotAccount(profile);
    summoner = await fetchSummonerByPuuid(profile.region, account.puuid).catch(() => null);
    matchIds = await fetchArenaMatchIds(account, profile.routing, limit, {
      startTime: scope === "season" ? seasonStartTimestamp() : null,
    });
    const existingRiotMatches = new Map(
      existingDb.matches
        .filter((match) => match.userId === user.id && match.source?.type === "riot" && match.source?.matchId)
        .map((match) => [match.source.matchId, normalizeMatch(match, user.id, "riot")]),
    );
    const idsToFetch = [];
    matchIds.forEach((matchId) => {
      const existingMatch = existingRiotMatches.get(matchId);
      if (!(existingMatch && Array.isArray(existingMatch.players) && existingMatch.players.length)) {
        idsToFetch.push(matchId);
      }
    });
    job = createSyncJob(syncJobs, {
      ownerId: user.id,
      scope,
      limit,
      account,
      summoner,
      matchIds,
      remainingIds: idsToFetch,
    });
  }

  const idsToFetchNow = job.remainingIds.slice(0, batch);
  job.remainingIds = job.remainingIds.slice(idsToFetchNow.length);
  job.expiresAt = Date.now() + SYNC_JOB_TTL_MS;
  const pendingCount = job.remainingIds.length;
  const matchDetails = await fetchMatchDetails(profile.routing, idsToFetchNow);

  const imported = matchDetails
    .map((detail) => mapRiotMatch(detail, account.puuid, user.id))
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let importedCount = 0;
  await mutateDb((db) => {
    const storedUser = db.users.find((item) => item.id === user.id);
    storedUser.riotProfile = {
      ...profile,
      puuid: account.puuid,
      profileIconId: summoner?.profileIconId || profile.profileIconId || null,
      verifiedAt: new Date().toISOString(),
      lastSyncAttemptAt: new Date().toISOString(),
      lastSyncedAt: pendingCount ? profile.lastSyncedAt : new Date().toISOString(),
    };

    const importedByKey = new Map(imported.map((match) => [matchDedupeKey(match), match]));
    db.matches = db.matches.map((match) => {
      const key = matchDedupeKey(match);
      if (match.userId === user.id && importedByKey.has(key)) {
        const replacement = importedByKey.get(key);
        importedByKey.delete(key);
        return {
          ...match,
          ...replacement,
          id: match.id || replacement.id,
          createdAt: match.createdAt || replacement.createdAt,
        };
      }
      return match;
    });
    const existingKeys = new Set(db.matches.map(matchDedupeKey));
    imported.forEach((match) => {
      const key = matchDedupeKey(match);
      if (!existingKeys.has(key)) {
        db.matches.unshift(match);
        existingKeys.add(key);
        importedCount += 1;
      }
    });
  });

  const db = await readDb();
  if (!pendingCount) syncJobs.delete(job.id);
  sendJson(res, 200, {
    syncJobId: pendingCount ? job.id : "",
    importedCount,
    scannedCount: matchDetails.length,
    reusedCount: Math.max(0, matchIds.length - job.remainingIds.length - matchDetails.length),
    pendingCount,
    totalRiotMatchCount: matchIds.length,
    hasMore: pendingCount > 0,
    scope,
    matches: db.matches.filter((match) => match.userId === user.id),
    user: publicUser(db.users.find((item) => item.id === user.id)),
  });
}

async function requireAuth(req, res) {
  const token = parseCookies(req.headers.cookie || "")[SESSION_COOKIE];
  const session = token ? sessions.get(token) : null;

  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    sendJson(res, 401, { error: "Wymagane logowanie." });
    return null;
  }

  const db = await readDb();
  const user = db.users.find((item) => item.id === session.userId);
  if (!user) {
    sessions.delete(token);
    sendJson(res, 401, { error: "Sesja wygasła." });
    return null;
  }

  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return { user };
}

function setSession(res, userId) {
  const token = randomBytes(32).toString("base64url");
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`,
  );
}

async function fetchRiotAccount(profile) {
  const gameName = encodeURIComponent(profile.gameName);
  const tagLine = encodeURIComponent(profile.tagLine);
  return riotFetch(profile.routing, `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`);
}

async function fetchSummonerByPuuid(region, puuid) {
  return riotFetch(region, `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`);
}

async function fetchArenaMatchIds(account, routing, limit, options = {}) {
  const ids = [];
  for (const queueId of ARENA_QUEUE_IDS) {
    let start = 0;
    while (ids.length < limit) {
      const count = Math.max(1, Math.min(100, limit - ids.length));
      const params = new URLSearchParams({
        queue: String(queueId),
        start: String(start),
        count: String(count),
      });
      if (options.startTime) params.set("startTime", String(options.startTime));
      const pathName = `/lol/match/v5/matches/by-puuid/${encodeURIComponent(
        account.puuid,
      )}/ids?${params.toString()}`;
      const queueIds = await riotFetch(routing, pathName);
      if (!Array.isArray(queueIds) || !queueIds.length) break;
      ids.push(...queueIds);
      if (queueIds.length < count) break;
      start += count;
    }
  }
  return [...new Set(ids)].slice(0, limit);
}

async function fetchMatchDetails(routing, matchIds) {
  if (!matchIds.length) return [];
  const details = [];
  let cursor = 0;
  const workerCount = Math.min(RIOT_MATCH_DETAIL_CONCURRENCY, matchIds.length);

  async function worker() {
    while (cursor < matchIds.length) {
      const matchId = matchIds[cursor];
      cursor += 1;
      try {
        const detail = await riotFetch(routing, `/lol/match/v5/matches/${encodeURIComponent(matchId)}`);
        details.push(detail);
      } catch (error) {
        if ([401, 403].includes(Number(error.status))) throw error;
        console.warn(`[riot] skipped match ${matchId}: ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, worker));
  return details;
}

async function riotFetch(routing, pathName, attempt = 0) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RIOT_FETCH_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`https://${routing}.api.riotgames.com${pathName}`, {
      signal: controller.signal,
      headers: {
        "X-Riot-Token": process.env.RIOT_API_KEY,
        "User-Agent": "ArenaTracker/0.5 local dev",
      },
    });
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Riot API nie odpowiedziało w czasie.");
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after") || 1);
      await delay(Math.max(1000, retryAfter * 1000));
      return riotFetch(routing, pathName, attempt + 1);
    }
    let message = `Riot API HTTP ${response.status}`;
    try {
      const data = await response.json();
      message = data.status?.message || message;
    } catch {
      // Keep the HTTP status message.
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function mapRiotMatch(detail, puuid, userId) {
  if (!ARENA_QUEUE_IDS.includes(Number(detail.info?.queueId))) return null;
  const participant = detail.info.participants.find((item) => item.puuid === puuid);
  if (!participant) return null;
  const placementFor = (item) => clamp(Number(item.placement || item.subteamPlacement || (item.win ? 1 : ARENA_MAX_PLACEMENT)), 1, ARENA_MAX_PLACEMENT);
  const itemsFor = (item) => [0, 1, 2, 3, 4, 5, 6]
    .map((slot) => item[`item${slot}`])
    .filter(Boolean)
    .map(resolveItemTag)
    .filter(Boolean);
  const augmentsFor = (item) => [1, 2, 3, 4, 5, 6]
    .map((slot) => item[`playerAugment${slot}`])
    .filter(Boolean)
    .map(resolveAugmentTag)
    .filter(Boolean);
  const teammates = detail.info.participants
    .filter((item) => item.puuid !== puuid && item.playerSubteamId === participant.playerSubteamId)
    .map((item) => ({
      champion: canonicalChampionName(item.championName) || "Unknown",
      riotId: formatRiotId(item),
      puuid: item.puuid,
      placement: placementFor(item),
    }));
  const players = detail.info.participants.map((item) => ({
    champion: canonicalChampionName(item.championName) || "Unknown",
    riotId: formatRiotId(item),
    puuid: item.puuid,
    placement: placementFor(item),
    teamId: cleanText(item.playerSubteamId),
    augments: augmentsFor(item),
    items: itemsFor(item),
  }));

  const patch = cleanText(detail.info.gameVersion).split(".").slice(0, 2).join(".") || "unknown";
  const playedAt = new Date(detail.info.gameStartTimestamp || Date.now()).toISOString();
  const date = playedAt.slice(0, 10);
  const placement = placementFor(participant);
  const items = itemsFor(participant);
  const augments = augmentsFor(participant);

  return {
    id: makeId("match"),
    userId,
    date,
    playedAt,
    patch,
    champion: canonicalChampionName(participant.championName) || "Unknown",
    partner: teammates.map((teammate) => teammate.champion).join(" + "),
    teammates,
    players,
    placement: clamp(placement, 1, ARENA_MAX_PLACEMENT),
    ratingDelta: 0,
    augments,
    items,
    note: "",
    source: {
      type: "riot",
      matchId: detail.metadata.matchId,
      queueId: Number(detail.info.queueId),
      puuid,
    },
    createdAt: new Date().toISOString(),
  };
}

function normalizeRiotProfile(body) {
  const gameName = cleanText(body.gameName);
  const tagLine = cleanText(body.tagLine).replace(/^#/, "");
  const routing = cleanText(body.routing || DEFAULT_ROUTING).toLowerCase();
  const region = cleanText(body.region || "eun1").toLowerCase();

  if (!gameName || !tagLine) {
    const error = new Error("Podaj konto League w formacie nazwa + tag.");
    error.status = 400;
    throw error;
  }

  if (!ROUTINGS.has(routing) || !REGIONS.has(region)) {
    const error = new Error("Nieobsługiwany region Riot.");
    error.status = 400;
    throw error;
  }

  return { gameName, tagLine, routing, region };
}

function normalizeMatch(match, userId, sourceType) {
  const source = match.source && typeof match.source === "object" ? match.source : { type: sourceType };
  const teammates = Array.isArray(match.teammates)
    ? match.teammates.map(normalizeTeammate).filter(Boolean)
    : [];
  const players = Array.isArray(match.players)
    ? match.players.map(normalizePlayer).filter(Boolean)
    : [];
  return {
    id: cleanText(match.id) || makeId("match"),
    userId,
    date: cleanText(match.date) || new Date().toISOString().slice(0, 10),
    playedAt: cleanText(match.playedAt),
    patch: cleanText(match.patch) || "unknown",
    champion: canonicalChampionName(match.champion) || "Unknown",
    partner: cleanText(match.partner),
    teammates,
    players,
    placement: clamp(Number(match.placement || ARENA_MAX_PLACEMENT), 1, ARENA_MAX_PLACEMENT),
    ratingDelta: Number(match.ratingDelta || 0),
    augments: Array.isArray(match.augments)
      ? match.augments.map(resolveAugmentTag).filter(Boolean)
      : [],
    items: Array.isArray(match.items) ? match.items.map(resolveItemTag).filter(Boolean) : [],
    note: normalizeMatchNote(match.note),
    source,
    createdAt: match.createdAt || new Date().toISOString(),
  };
}

function matchDedupeKey(match) {
  if (match.source?.matchId) return `${match.userId}:riot:${match.source.matchId}`;
  return `${match.userId}:manual:${match.id}`;
}

async function serveStatic(req, res, url) {
  if (req.method.toUpperCase() !== "GET") {
    sendText(res, 405, "Method not allowed");
    return;
  }

  const relativePath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const filePath = path.resolve(ROOT, relativePath);

  if (!filePath.startsWith(ROOT)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");
    const data = await readFile(filePath);
    const extension = path.extname(filePath);
    const type = contentTypes[extension] || "application/octet-stream";
    const headers = { "Content-Type": type };
    if ([".html", ".js", ".css"].includes(extension)) {
      headers["Cache-Control"] = "no-store";
    }
    res.writeHead(200, headers);
    res.end(data);
  } catch {
    if (!path.extname(relativePath)) {
      const data = await readFile(path.join(ROOT, "index.html"));
      res.writeHead(200, { "Content-Type": contentTypes[".html"] });
      res.end(data);
      return;
    }
    sendText(res, 404, "Not found");
  }
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error("Request body is too large.");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Invalid JSON body.");
    error.status = 400;
    throw error;
  }
}

async function readDb() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    return normalizeDb(parseDbJson(await readFile(DB_PATH, "utf8")));
  } catch {
    return normalizeDb({});
  }
}

async function mutateDb(mutator) {
  const operation = dbWriteQueue.then(async () => {
    const db = await readDb();
    await mutator(db);
    const tempPath = `${DB_PATH}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
    await rename(tempPath, DB_PATH);
    return db;
  });
  dbWriteQueue = operation.catch(() => {});
  return operation;
}

function parseDbJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const end = findFirstJsonObjectEnd(text);
    if (end > 0) return JSON.parse(text.slice(0, end));
    throw error;
  }
}

function findFirstJsonObjectEnd(text) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let started = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (!started) {
      if (/\s/.test(char)) continue;
      if (char !== "{") return -1;
      started = true;
      depth = 1;
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }

  return -1;
}

function normalizeDb(db) {
  const source = db && typeof db === "object" ? db : {};
  return {
    ...source,
    users: Array.isArray(source.users) ? source.users : [],
    matches: Array.isArray(source.matches) ? source.matches : [],
    publicProfiles: Array.isArray(source.publicProfiles) ? source.publicProfiles : [],
  };
}

async function writeResetOutboxMessage(message) {
  await mkdir(DATA_DIR, { recursive: true });
  let outbox = [];
  try {
    outbox = JSON.parse(await readFile(RESET_OUTBOX_PATH, "utf8"));
    if (!Array.isArray(outbox)) outbox = [];
  } catch {
    outbox = [];
  }
  outbox.unshift(message);
  await writeFile(RESET_OUTBOX_PATH, `${JSON.stringify(outbox, null, 2)}\n`, "utf8");
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    riotProfile: user.riotProfile
      ? {
          gameName: user.riotProfile.gameName,
          tagLine: user.riotProfile.tagLine,
          routing: user.riotProfile.routing,
          region: user.riotProfile.region,
          publicPath: `/${publicRegionSlug(user.riotProfile.region)}/${encodeURIComponent(publicProfileSlug(user.riotProfile))}`,
          profileIconId: user.riotProfile.profileIconId || null,
          profileIconUrl: profileIconUrl(user.riotProfile.profileIconId),
          verifiedAt: user.riotProfile.verifiedAt,
          lastSyncedAt: user.riotProfile.lastSyncedAt,
        }
      : null,
  };
}

function formatRiotId(participant) {
  const gameName = cleanText(participant.riotIdGameName || participant.summonerName);
  const tagLine = cleanText(participant.riotIdTagline);
  return tagLine ? `${gameName}#${tagLine}` : gameName;
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

function profileIconUrl(profileIconId) {
  return profileIconId
    ? `https://ddragon.leagueoflegends.com/cdn/${GAME_DATA.version || "16.13.1"}/img/profileicon/${profileIconId}.png`
    : "";
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = String(passwordHash || "").split(":");
  if (!salt || !storedHash) return false;
  const actual = Buffer.from(scryptSync(password, salt, 64).toString("hex"), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function parseCookies(header) {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function cleanText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function resolveItemName(value) {
  return resolveItemTag(value)?.name || "";
}

function resolveItemTag(value) {
  return resolveGameAssetTag(value, GAME_DATA.items, GAME_DATA.itemIcons, GAME_DATA.itemAliases, GAME_DATA.itemDetails);
}

function resolveAugmentName(value) {
  return resolveAugmentTag(value)?.name || "";
}

function resolveAugmentTag(value) {
  return resolveGameAssetTag(value, GAME_DATA.augments, GAME_DATA.augmentIcons, GAME_DATA.augmentAliases, GAME_DATA.augmentDetails);
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
    icon: cleanText(source.icon || detail.icon || icons?.[id]),
    tier: cleanText(source.tier || detail.tier),
    price: Number(source.price || detail.price || 0),
  };
}

function canonicalChampionName(value) {
  const text = cleanText(value);
  if (!text) return "";
  return GAME_DATA.championKeys?.[text] || GAME_DATA.championAliases?.[normalizeLookupKey(text)] || text;
}

function normalizeMatchNote(value) {
  const note = cleanText(value);
  return /^Zaimportowano z Riot Match-V5/i.test(note) ? "" : note;
}

function seasonStartTimestamp() {
  const now = new Date();
  return Math.floor(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0) / 1000);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function publicProfileSlug(profile) {
  if (!profile?.gameName || !profile?.tagLine) return "";
  return `${profile.gameName}-${profile.tagLine}`;
}

function parsePublicProfileSlug(slug) {
  const text = cleanText(safeDecode(slug));
  const separatorIndex = text.lastIndexOf("-");
  if (separatorIndex <= 0 || separatorIndex >= text.length - 1) return null;
  return {
    gameName: cleanText(text.slice(0, separatorIndex)),
    tagLine: cleanText(text.slice(separatorIndex + 1)).replace(/^#/, ""),
  };
}

function parseRiotIdQuery(query) {
  const text = cleanText(query);
  const separatorIndex = text.includes("#") ? text.indexOf("#") : text.lastIndexOf("-");
  if (separatorIndex <= 0 || separatorIndex >= text.length - 1) return null;
  return {
    gameName: cleanText(text.slice(0, separatorIndex)),
    tagLine: cleanText(text.slice(separatorIndex + 1)).replace(/^#/, ""),
  };
}

function publicRegionSlug(region) {
  const normalized = normalizePublicRegion(region);
  const match = [...PUBLIC_REGION_ALIASES.entries()].find(([, value]) => value === normalized);
  return match?.[0] || normalized;
}

function routingForRegion(region) {
  const normalized = normalizePublicRegion(region);
  if (["br1", "la1", "la2", "na1"].includes(normalized)) return "americas";
  if (["jp1", "kr"].includes(normalized)) return "asia";
  if (["oc1", "sg2", "tw2", "vn2"].includes(normalized)) return "sea";
  return "europe";
}

function normalizePublicRegion(region) {
  const text = cleanText(region).toLowerCase();
  return PUBLIC_REGION_ALIASES.get(text) || text;
}

function normalizeSlug(value) {
  return cleanText(safeDecode(String(value || ""))).toLowerCase();
}

function normalizeLookupKey(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function average(values) {
  return values.length ? values.reduce((total, value) => total + Number(value || 0), 0) / values.length : 0;
}

function extractNumericId(value) {
  const match = cleanText(value).match(/\b\d{2,6}\b/);
  return match?.[0] || "";
}

function makeId(prefix) {
  return `${prefix}-${randomBytes(12).toString("hex")}`;
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const index = trimmed.indexOf("=");
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

function loadGameData() {
  const dataPath = path.join(ROOT, "assets", "game-data.json");
  if (!existsSync(dataPath)) return { champions: [], items: {}, augments: {} };
  try {
    return JSON.parse(readFileSync(dataPath, "utf8"));
  } catch {
    return { champions: [], items: {}, augments: {} };
  }
}
