const http = require("node:http");
const { createHash, randomBytes, scryptSync, timingSafeEqual } = require("node:crypto");
const { existsSync, readFileSync } = require("node:fs");
const { mkdir, readFile, rename, unlink, writeFile, stat } = require("node:fs/promises");
const path = require("node:path");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "arenatracker-db.json");
const RESET_OUTBOX_PATH = path.join(DATA_DIR, "password-reset-outbox.json");
const PORT = Number(process.env.PORT || 4173);
const DEFAULT_HOST =
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID || process.env.NODE_ENV === "production"
    ? "0.0.0.0"
    : "127.0.0.1";
const HOST = process.env.HOST || DEFAULT_HOST;
const SESSION_COOKIE = "arena_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const MAX_BODY_BYTES = 1_000_000;
const DEFAULT_ARENA_QUEUE_IDS = [1750, 1740];
const ARENA_QUEUE_IDS = parseNumberList(process.env.ARENA_QUEUE_IDS, DEFAULT_ARENA_QUEUE_IDS);
const ARENA_QUEUE_ID_SET = new Set(ARENA_QUEUE_IDS);
const DEFAULT_ARENA_SEASON_START_ISO = "2026-05-01T00:00:00Z";
const ARENA_SEASON_START_MS = parseDateMs(process.env.ARENA_SEASON_START || DEFAULT_ARENA_SEASON_START_ISO);
const ARENA_MAX_PLACEMENT = 6;
const ARENA_CURRENT_TEAM_SIZE = 3;
const ARENA_CURRENT_PLAYER_COUNT = ARENA_MAX_PLACEMENT * ARENA_CURRENT_TEAM_SIZE;
const RIOT_SYNC_DEFAULT_LIMIT = 80;
const RIOT_SYNC_MAX_LIMIT = 500;
const PUBLIC_PROFILE_MATCH_LIMIT = RIOT_SYNC_MAX_LIMIT;
const PUBLIC_PROFILE_FETCH_BATCH = clamp(Number(process.env.PUBLIC_PROFILE_FETCH_BATCH || RIOT_SYNC_DEFAULT_LIMIT), 1, RIOT_SYNC_MAX_LIMIT);
const PUBLIC_PROFILE_CACHE_TTL_MS = 60 * 60 * 1000;
const RIOT_FETCH_TIMEOUT_MS = 20_000;
const RIOT_FETCH_RETRIES = clamp(Number(process.env.RIOT_FETCH_RETRIES || 4), 0, 8);
const RIOT_RETRY_AFTER_CAP_MS = clamp(Number(process.env.RIOT_RETRY_AFTER_CAP_MS || 120_000), 1_000, 180_000);
const RIOT_MATCH_DETAIL_CONCURRENCY = clamp(Number(process.env.RIOT_MATCH_DETAIL_CONCURRENCY || 4), 1, 12);
const RIOT_LIVE_PARTICIPANT_CONCURRENCY = 18;
const RIOT_LIVE_OPTIONAL_TIMEOUT_MS = 1_200;
const LIVE_GAME_CACHE_TTL_MS = 30 * 1000;
const LIVE_GAME_STALE_TTL_MS = 5 * 60 * 1000;
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
const liveGameCache = new Map();
const SYNC_JOB_TTL_MS = 10 * 60 * 1000;

function parseNumberList(value, fallback) {
  const parsed = String(value || "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
  return [...new Set(parsed.length ? parsed : fallback || [])];
}

function isArenaQueueId(queueId) {
  return ARENA_QUEUE_ID_SET.has(Number(queueId));
}

function isArenaGameMode(gameMode) {
  const mode = cleanText(gameMode).toUpperCase();
  return mode === "CHERRY" || mode === "ARENA";
}

function isArenaLiveGame(game) {
  return Boolean(game) && (isArenaQueueId(game.gameQueueConfigId) || isArenaGameMode(game.gameMode));
}

function isArenaMatchDetail(detail) {
  const info = detail?.info || {};
  return isArenaQueueId(info.queueId) || isArenaGameMode(info.gameMode);
}

function isCurrentArenaMatchDetail(detail) {
  const participants = Array.isArray(detail?.info?.participants) ? detail.info.participants : [];
  return isArenaMatchDetail(detail)
    && isCurrentArenaSeasonTimestamp(detail?.info?.gameStartTimestamp)
    && participants.length >= ARENA_CURRENT_PLAYER_COUNT
    && !hasLegacyArenaTeamShape(participants);
}

function isCurrentArenaSeasonTimestamp(value) {
  const timestamp = Number(value);
  if (!ARENA_SEASON_START_MS || !Number.isFinite(timestamp) || timestamp <= 0) return true;
  return timestamp >= ARENA_SEASON_START_MS;
}

function isCurrentArenaSeasonDate(value) {
  if (!ARENA_SEASON_START_MS) return true;
  const ms = Date.parse(cleanText(value));
  if (!Number.isFinite(ms)) return true;
  return ms >= ARENA_SEASON_START_MS;
}

function teamIdFromPlayer(player) {
  return cleanText(player?.teamId ?? player?.playerSubteamId ?? player?.subteamId ?? player?.subteam);
}

function hasCurrentArenaTeamShape(players, options = {}) {
  const source = Array.isArray(players) ? players : [];
  if (source.length !== ARENA_CURRENT_PLAYER_COUNT) return false;

  const grouped = new Map();
  source.forEach((player) => {
    const teamId = teamIdFromPlayer(player);
    if (!teamId) return;
    grouped.set(teamId, (grouped.get(teamId) || 0) + 1);
  });

  if (!grouped.size) return Boolean(options.allowMissingTeamIds);
  return grouped.size === ARENA_MAX_PLACEMENT
    && [...grouped.values()].every((count) => count === ARENA_CURRENT_TEAM_SIZE);
}

function hasLegacyArenaTeamShape(players) {
  const source = Array.isArray(players) ? players : [];
  if (!source.length || source.length % 2 !== 0) return false;

  const grouped = new Map();
  source.forEach((player) => {
    const teamId = teamIdFromPlayer(player);
    if (!teamId) return;
    grouped.set(teamId, (grouped.get(teamId) || 0) + 1);
  });

  return grouped.size >= ARENA_MAX_PLACEMENT
    && [...grouped.values()].every((count) => count === 2);
}

function isRiotSourcedMatch(match) {
  const type = cleanText(match?.source?.type).toLowerCase();
  return type === "riot" || Boolean(match?.source?.matchId) || isArenaQueueId(match?.source?.queueId);
}

function isCurrentArenaStoredMatch(match) {
  if (!match) return false;
  if (!isRiotSourcedMatch(match)) return true;
  const players = Array.isArray(match.players) ? match.players : [];
  return isCurrentArenaSeasonDate(match.playedAt || match.date)
    && (!players.length || players.length >= ARENA_CURRENT_PLAYER_COUNT)
    && !hasLegacyArenaTeamShape(players);
}

function filterCurrentArenaMatches(matches) {
  return Array.isArray(matches) ? matches.filter(isCurrentArenaStoredMatch) : [];
}

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
      error: apiErrorMessage(error),
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

  if (method === "GET" && url.pathname === "/api/leaderboard") {
    await getLeaderboard(req, res, url);
    return;
  }

  if (method === "GET" && url.pathname === "/api/matches") {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const db = await readDb();
    const matches = db.matches
      .filter((match) => match.userId === auth.user.id)
      .filter(isCurrentArenaStoredMatch)
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
      matches: db.matches.filter((match) => match.userId === auth.user.id).filter(isCurrentArenaStoredMatch),
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

  if (method === "GET" && url.pathname === "/api/riot/live-game") {
    await getLiveGame(req, res, url);
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

  if (user && (forceRefresh || syncJobId)) {
    const cached = findCachedPublicProfile(db, region, slug);
    let fetched = null;
    try {
      fetched = await fetchRiotPublicProfile(region, slug, { existing: cached, limit, batch, syncJobId });
    } catch (error) {
      const fallbackMatches = cached?.matches?.length
        ? cached.matches
        : db.matches
            .filter((match) => match.userId === user.id)
            .map((match) => normalizeMatch(match, user.id, match.source?.type || "riot"))
            .filter(isCurrentArenaStoredMatch);
      if (fallbackMatches.length) {
        sendJson(res, 200, {
          ...buildPublicProfile(cached || user, fallbackMatches),
          warning: apiErrorMessage(error),
        });
        return;
      }
      throw error;
    }
    if (fetched) {
      await savePublicProfileCache(fetched);
      sendJson(res, 200, buildPublicProfile(fetched, fetched.matches));
      return;
    }
  }

  if (!user) {
    const cached = findCachedPublicProfile(db, region, slug);
    if (!forceRefresh && !syncJobId && cached) {
      sendJson(res, 200, buildPublicProfile(cached, cached.matches || []));
      return;
    }

    const shouldRefresh = forceRefresh || Boolean(syncJobId) || !cached || isPublicProfileCacheStale(cached);

    if (!shouldRefresh && cached) {
      sendJson(res, 200, buildPublicProfile(cached, cached.matches || []));
      return;
    }

    let fetched = null;
    try {
      fetched = await fetchRiotPublicProfile(region, slug, { existing: cached, limit, batch, syncJobId });
    } catch (error) {
      if (cached) {
        sendJson(res, 200, {
          ...buildPublicProfile(cached, cached.matches || []),
          warning: apiErrorMessage(error),
        });
        return;
      }
      throw error;
    }
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
    .filter(isCurrentArenaStoredMatch)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const cached = findCachedPublicProfile(db, region, slug);
  if (cached && Array.isArray(cached.matches) && cached.matches.length >= matches.length) {
    sendJson(res, 200, buildPublicProfile(cached, cached.matches || []));
    return;
  }

  const payload = buildPublicProfile(user, matches);
  if (cached?.riotProfile?.profileIconId) {
    payload.profile.profileIconUrl = profileIconUrl(cached.riotProfile.profileIconId);
  }
  if (cached?.riotProfile?.lastSyncedAt || cached?.updatedAt) {
    payload.profile.lastSyncedAt = cached.riotProfile.lastSyncedAt || cached.updatedAt;
  }
  sendJson(res, 200, payload);
}

async function getLeaderboard(req, res, url) {
  const limit = clamp(Number(url.searchParams.get("limit") || 50), 1, 100);
  const regionFilter = normalizePublicRegion(url.searchParams.get("region"));
  if (regionFilter && !REGIONS.has(regionFilter)) {
    sendJson(res, 400, { message: "Nieprawidlowy region." });
    return;
  }
  const db = await readDb();
  const rowsByKey = new Map();

  const addRow = (profile, matches, source, updatedAt) => {
    if (!profile?.gameName || !profile?.tagLine) return;
    const region = normalizePublicRegion(profile.region);
    if (regionFilter && region !== regionFilter) return;
    const slug = publicProfileSlug({ ...profile, region });
    const key = publicProfileCacheId(region, slug);
    const normalizedMatches = Array.isArray(matches)
      ? matches
          .map((match) => normalizeMatch(match, source, match.source?.type || "riot"))
          .filter(Boolean)
          .filter(isCurrentArenaStoredMatch)
      : [];
    const championStats = getChampionStatsForMatches(normalizedMatches);
    const championWins = championStats.filter((stat) => stat.wins > 0).length;
    const wins = normalizedMatches.filter((match) => Number(match.placement) === 1).length;
    const top4 = normalizedMatches.filter((match) => Number(match.placement) <= 4).length;
    const score = championWins * 100 + wins * 20 + top4 * 3 + normalizedMatches.length;
    const row = {
      gameName: profile.gameName,
      tagLine: profile.tagLine,
      region,
      slug,
      publicPath: `/${publicRegionSlug(region)}/${encodeURIComponent(slug)}`,
      profileIconUrl: profileIconUrl(profile.profileIconId),
      score,
      championWins,
      wins,
      top4,
      matches: normalizedMatches.length,
      lastSyncedAt: profile.lastSyncedAt || updatedAt || null,
    };
    const existing = rowsByKey.get(key);
    if (!existing || row.matches > existing.matches || Date.parse(row.lastSyncedAt || "") > Date.parse(existing.lastSyncedAt || "")) {
      rowsByKey.set(key, row);
    }
  };

  db.publicProfiles.forEach((entry) => {
    addRow(entry.riotProfile, entry.matches || [], "public", entry.updatedAt);
  });

  db.users.forEach((user) => {
    if (!user.riotProfile?.gameName || !user.riotProfile?.tagLine) return;
    const matches = db.matches.filter((match) => match.userId === user.id);
    addRow(user.riotProfile, matches, user.id, user.riotProfile.lastSyncedAt || user.updatedAt);
  });

  const rows = [...rowsByKey.values()]
    .sort((a, b) => b.score - a.score || b.championWins - a.championWins || b.wins - a.wins || b.matches - a.matches)
    .slice(0, limit)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  sendJson(res, 200, {
    region: regionFilter || null,
    rows,
    updatedAt: new Date().toISOString(),
  });
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

async function getLiveGame(req, res, url) {
  if (!process.env.RIOT_API_KEY) {
    sendJson(res, 400, { error: "RIOT_API_KEY is required for live game." });
    return;
  }

  const region = normalizePublicRegion(url.searchParams.get("region")) || "euw1";
  if (!REGIONS.has(region)) {
    sendJson(res, 400, { error: "Invalid region." });
    return;
  }

  const parsed = parseRiotIdQuery(url.searchParams.get("riotId") || url.searchParams.get("slug"));
  if (!parsed) {
    sendJson(res, 400, { error: "Pass a full Riot ID, for example No Chrystus#2137." });
    return;
  }

  const cacheKey = `${region}:${normalizeLookupKey(parsed.gameName)}:${normalizeLookupKey(parsed.tagLine)}`;
  const cached = liveGameCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    sendJson(res, 200, { ...cached.data, cached: true });
    return;
  }

  try {
    const routing = routingForRegion(region);
    const account = await fetchRiotAccount({ ...parsed, routing });
    const liveFetchOptions = { timeoutMs: RIOT_LIVE_OPTIONAL_TIMEOUT_MS, retries: 0, retryAfterCapMs: 1_500 };
    const summoner = await fetchSummonerByPuuid(region, account.puuid, liveFetchOptions).catch(() => null);
    const activeGame = await fetchActiveGameByPuuid(region, account.puuid, {
      timeoutMs: 12_000,
      retries: 1,
      retryAfterCapMs: 1_500,
    });

    if (!isArenaLiveGame(activeGame)) {
      const payload = {
        active: false,
        region,
        profile: {
          gameName: account.gameName || parsed.gameName,
          tagLine: account.tagLine || parsed.tagLine,
          region,
          profileIconUrl: profileIconUrl(summoner?.profileIconId),
        },
        fetchedAt: new Date().toISOString(),
      };
      liveGameCache.set(cacheKey, { data: payload, expiresAt: Date.now() + LIVE_GAME_CACHE_TTL_MS });
      sendJson(res, 200, payload);
      return;
    }

    const participants = Array.isArray(activeGame.participants) ? activeGame.participants : [];
    const players = await mapWithConcurrency(participants, RIOT_LIVE_PARTICIPANT_CONCURRENCY, async (participant, index) => {
      const [participantSummoner, rank] = await Promise.all([
        withTimeout(fetchLiveParticipantSummoner(region, participant, liveFetchOptions), RIOT_LIVE_OPTIONAL_TIMEOUT_MS, null),
        withTimeout(fetchSoloQueueRank(region, participant.puuid, participant.summonerId, liveFetchOptions), RIOT_LIVE_OPTIONAL_TIMEOUT_MS, null),
      ]);
      const champion = championNameById(participant.championId);
      return {
        riotId: formatLiveRiotId(participant),
        puuid: cleanText(participant.puuid),
        liveOrder: index,
        champion,
        championIconUrl: GAME_DATA.championIcons?.[champion] || "",
        profileIconUrl: profileIconUrl(participantSummoner?.profileIconId || participant.profileIconId),
        summonerLevel: participantSummoner?.summonerLevel || null,
        soloRank: formatSoloQueueRank(rank),
      };
    });

    const payload = {
      active: true,
      region,
      queueId: activeGame.gameQueueConfigId,
      gameId: cleanText(activeGame.gameId),
      gameStartTime: activeGame.gameStartTime || null,
      gameLength: activeGame.gameLength || 0,
      profile: {
        gameName: account.gameName || parsed.gameName,
        tagLine: account.tagLine || parsed.tagLine,
        region,
        profileIconUrl: profileIconUrl(summoner?.profileIconId),
      },
      players: players.sort((a, b) => Number(a.liveOrder || 0) - Number(b.liveOrder || 0)),
      teams: [],
      fetchedAt: new Date().toISOString(),
    };
    liveGameCache.set(cacheKey, { data: payload, expiresAt: Date.now() + LIVE_GAME_CACHE_TTL_MS });
    sendJson(res, 200, payload);
  } catch (error) {
    if (cached?.data && cached.expiresAt + LIVE_GAME_STALE_TTL_MS > Date.now()) {
      sendJson(res, 200, {
        ...cached.data,
        cached: true,
        stale: true,
        warning: apiErrorMessage(error),
      });
      return;
    }
    throw error;
  }
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
  let rankedEntries;

  if (job) {
    account = job.account;
    summoner = job.summoner;
    matchIds = job.matchIds;
    rankedEntries = job.rankedEntries || [];
  } else {
    account = await fetchRiotAccount({ ...parsed, routing });
    summoner = await fetchSummonerByPuuid(region, account.puuid).catch(() => null);
    matchIds = await fetchArenaMatchIds(account, routing, limit, {
      startTime: seasonStartTimestamp(),
    });
    rankedEntries = await fetchRankedEntries(region, account.puuid, summoner?.id)
      .catch(() => existing?.riotProfile?.rankedEntries || []);
  }
  const existingMatches = Array.isArray(existing?.matches)
    ? existing.matches
        .map((match) => normalizeMatch(match, "public", "riot"))
        .filter(Boolean)
        .filter(isCurrentArenaStoredMatch)
    : [];
  const existingByMatchId = new Map(
    existingMatches
      .filter((match) => match.source?.matchId && matchHasCompletePlayerLoadout(match))
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
      rankedEntries,
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
    profileIconId: summoner?.profileIconId || existing?.riotProfile?.profileIconId || null,
    rankedEntries: formatRankedEntries(rankedEntries),
    lastSyncedAt: pendingCount ? existing?.riotProfile?.lastSyncedAt || null : new Date().toISOString(),
    lastSyncAttemptAt: new Date().toISOString(),
  };
  const importedMatches = details
    .map((detail) => mapRiotMatch(detail, account.puuid, "public"))
    .filter(Boolean);
  const seasonExistingMatches = existingMatches;
  const matches = mergeMatchesByKey([...importedMatches, ...seasonExistingMatches])
    .filter(isCurrentArenaStoredMatch)
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
  return db.publicProfiles.find((profile) => {
    if (profile.id === id) return true;
    const riotProfile = profile.riotProfile;
    if (!riotProfile?.gameName || !riotProfile?.tagLine) return false;
    return publicProfileCacheId(riotProfile.region, publicProfileSlug(riotProfile)) === id;
  });
}

function isPublicProfileCacheStale(profile) {
  if (!profile.riotProfile?.profileIconId) return true;
  const updatedAt = Date.parse(profile.updatedAt || profile.riotProfile?.lastSyncedAt || "");
  return !updatedAt || Date.now() - updatedAt > PUBLIC_PROFILE_CACHE_TTL_MS;
}

function apiErrorMessage(error) {
  if (error?.status && error.message) return error.message;
  if (error?.name === "SyntaxError") return "Nie udało się przetworzyć danych wejściowych.";
  return "Wystąpił błąd po stronie serwera. Spróbuj ponownie za chwilę.";
}

async function savePublicProfileCache(profile) {
  await mutateDb((db) => {
    const id = publicProfileCacheId(profile.riotProfile.region, publicProfileSlug(profile.riotProfile));
    const index = db.publicProfiles.findIndex((item) => {
      if (item.id === id) return true;
      const riotProfile = item.riotProfile;
      if (!riotProfile?.gameName || !riotProfile?.tagLine) return false;
      return publicProfileCacheId(riotProfile.region, publicProfileSlug(riotProfile)) === id;
    });
    const existing = index >= 0 ? db.publicProfiles[index] : null;
    const mergedMatches = mergeMatchesByKey([
      ...(profile.matches || []),
      ...(existing?.matches || []),
    ]);
    const stored = {
      ...profile,
      id,
      riotProfile: {
        ...(existing?.riotProfile || {}),
        ...profile.riotProfile,
        lastSyncedAt: profile.riotProfile.lastSyncedAt || existing?.riotProfile?.lastSyncedAt || null,
      },
      matches: filterCurrentArenaMatches(mergedMatches),
      updatedAt: profile.updatedAt || new Date().toISOString(),
    };
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
  const currentMatches = filterCurrentArenaMatches(matches);
  const championStats = getChampionStatsForMatches(currentMatches);
  const wonChampions = championStats
    .filter((stat) => stat.wins > 0)
    .sort((a, b) => a.champion.localeCompare(b.champion));
  const profile = user.riotProfile;
  const sync = user.sync || null;
  const isPartialSync = Boolean(sync?.hasMore);

  return {
    profile: {
      gameName: profile.gameName,
      tagLine: profile.tagLine,
      region: profile.region,
      slug: publicProfileSlug(profile),
      profileIconUrl: profileIconUrl(profile.profileIconId),
      rankedEntries: formatRankedEntries(profile.rankedEntries || []),
      lastSyncedAt: isPartialSync ? profile.lastSyncedAt || null : profile.lastSyncedAt || user.updatedAt || null,
    },
    progress: {
      won: wonChampions.length,
      total: GAME_DATA.champions?.length || 0,
    },
    sync,
    wonChampions: wonChampions.map((stat) => ({
      champion: stat.champion,
      wins: stat.wins,
      games: stat.games,
      averagePlacement: stat.avg,
      icon: GAME_DATA.championIcons?.[stat.champion] || "",
    })),
    matches: currentMatches.map(publicMatchSummary),
    topDuo: getPartnerStatsForMatches(currentMatches).slice(0, 8),
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
  const scope = "season";
  const batch = clamp(Number(body.batch || RIOT_SYNC_DEFAULT_LIMIT), 1, limit);
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
    existingRiotMatches.forEach((match, matchId) => {
      if (!isCurrentArenaStoredMatch(match)) existingRiotMatches.delete(matchId);
    });
    const idsToFetch = [];
    matchIds.forEach((matchId) => {
      const existingMatch = existingRiotMatches.get(matchId);
      if (!matchHasCompletePlayerLoadout(existingMatch)) {
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
  const rankedEntries = await fetchRankedEntries(profile.region, account.puuid, summoner?.id)
    .catch(() => profile.rankedEntries || []);

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
      rankedEntries: formatRankedEntries(rankedEntries),
      verifiedAt: new Date().toISOString(),
      lastSyncAttemptAt: new Date().toISOString(),
      lastSyncedAt: pendingCount ? profile.lastSyncedAt : new Date().toISOString(),
    };

    const importedByKey = new Map(imported.map((match) => [matchDedupeKey(match), match]));
    db.matches = db.matches.filter((match) => match.userId !== user.id || isCurrentArenaStoredMatch(match));
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
    matches: db.matches.filter((match) => match.userId === user.id).filter(isCurrentArenaStoredMatch),
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

async function fetchSummonerByPuuid(region, puuid, options) {
  return riotFetch(region, `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`, options);
}

async function fetchSummonerById(region, summonerId, options) {
  return riotFetch(region, `/lol/summoner/v4/summoners/${encodeURIComponent(summonerId)}`, options);
}

async function fetchLiveParticipantSummoner(region, participant, options) {
  if (participant.puuid) return fetchSummonerByPuuid(region, participant.puuid, options);
  if (participant.summonerId) return fetchSummonerById(region, participant.summonerId, options);
  return null;
}

async function fetchActiveGameByPuuid(region, puuid, options) {
  try {
    return await riotFetch(region, `/lol/spectator/v5/active-games/by-summoner/${encodeURIComponent(puuid)}`, options);
  } catch (error) {
    if (Number(error.status) === 404) return null;
    throw error;
  }
}

async function fetchRankedEntries(region, puuid, summonerId, options) {
  let entries = [];
  if (puuid) {
    try {
      entries = await riotFetch(region, `/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`, options);
    } catch (error) {
      if (!summonerId || ![400, 404].includes(Number(error.status))) throw error;
    }
  }
  if (!entries.length && summonerId) {
    entries = await riotFetch(region, `/lol/league/v4/entries/by-summoner/${encodeURIComponent(summonerId)}`, options);
  }
  return Array.isArray(entries) ? entries : [];
}

async function fetchSoloQueueRank(region, puuid, summonerId, options) {
  const entries = await fetchRankedEntries(region, puuid, summonerId, options);
  return entries.find((entry) => entry.queueType === "RANKED_SOLO_5x5") || null;
}

function withTimeout(promise, timeoutMs, fallback) {
  let timer;
  return Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise((resolve) => {
      timer = setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer));
}

async function fetchArenaMatchIds(account, routing, limit, options = {}) {
  const pageSize = 100;
  const pageStarts = Array.from(
    { length: Math.ceil(limit / pageSize) },
    (_, index) => index * pageSize,
  );
  const pageTasks = ARENA_QUEUE_IDS.flatMap((queueId, queueIndex) =>
    pageStarts.map(async (start) => {
      const count = Math.max(1, Math.min(pageSize, limit - start));
      const params = new URLSearchParams({
        queue: String(queueId),
        start: String(start),
        count: String(count),
      });
      if (options.startTime) params.set("startTime", String(options.startTime));
      const pathName = `/lol/match/v5/matches/by-puuid/${encodeURIComponent(
        account.puuid,
      )}/ids?${params.toString()}`;
      try {
        const queueIds = await riotFetch(routing, pathName);
        return { queueId, queueIndex, start, ids: Array.isArray(queueIds) ? queueIds : [] };
      } catch (error) {
        if ([400, 404].includes(Number(error.status))) {
          console.warn(`[riot] skipped arena queue ${queueId}: ${error.message}`);
          return { queueId, queueIndex, start, ids: [] };
        }
        throw error;
      }
    }),
  );
  const pages = await Promise.all(pageTasks);
  const deduped = [];
  const seen = new Set();
  pages
    .sort((a, b) => a.start - b.start || a.queueIndex - b.queueIndex)
    .forEach((page) => {
      page.ids.forEach((matchId) => {
        if (!seen.has(matchId)) {
          deduped.push(matchId);
          seen.add(matchId);
        }
      });
    });
  return deduped
    .sort((a, b) => matchIdSortValue(b) - matchIdSortValue(a) || String(b).localeCompare(String(a)))
    .slice(0, limit);
}

function matchIdSortValue(matchId) {
  const numeric = String(matchId || "").match(/_(\d+)$/);
  return numeric ? Number(numeric[1]) : 0;
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
        if ([401, 403, 429, 500, 502, 503, 504].includes(Number(error.status))) throw error;
        console.warn(`[riot] skipped match ${matchId}: ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, worker));
  return details;
}

function matchHasCompletePlayerLoadout(match) {
  const players = Array.isArray(match?.players) ? match.players : [];
  if (!hasCurrentArenaTeamShape(players, { allowMissingTeamIds: true })) return false;
  return players.every((player) => {
    const augments = Array.isArray(player.augments) ? player.augments : [];
    const items = Array.isArray(player.items) ? player.items : [];
    return augments.length > 0 && items.length > 0;
  });
}

async function riotFetch(routing, pathName, optionsOrAttempt = 0) {
  const options = typeof optionsOrAttempt === "number" ? { attempt: optionsOrAttempt } : optionsOrAttempt || {};
  const attempt = Number(options.attempt || 0);
  const timeoutMs = Number(options.timeoutMs || RIOT_FETCH_TIMEOUT_MS);
  const retries = Number(options.retries ?? RIOT_FETCH_RETRIES);
  const retryAfterCapMs = clamp(Number(options.retryAfterCapMs || RIOT_RETRY_AFTER_CAP_MS), 1_000, RIOT_RETRY_AFTER_CAP_MS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
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
    const networkError = new Error("Nie udało się połączyć z Riot API. Spróbuj ponownie za chwilę.");
    networkError.status = 502;
    networkError.cause = error;
    throw networkError;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (response.status === 429 && attempt < retries) {
      const retryAfter = Number(response.headers.get("retry-after") || 1);
      await delay(Math.min(retryAfterCapMs, Math.max(1000, retryAfter * 1000)));
      return riotFetch(routing, pathName, { ...options, attempt: attempt + 1 });
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
  if (!isCurrentArenaMatchDetail(detail)) return null;
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
    const payload = `${JSON.stringify(db, null, 2)}\n`;
    await writeFile(tempPath, payload, "utf8");
    await replaceFileWithRetry(tempPath, DB_PATH, payload);
    return db;
  });
  dbWriteQueue = operation.catch(() => {});
  return operation;
}

async function replaceFileWithRetry(tempPath, targetPath, fallbackPayload) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      await rename(tempPath, targetPath);
      return;
    } catch (error) {
      lastError = error;
      if (!["EPERM", "EBUSY", "EACCES"].includes(error.code)) throw error;
      await delay(40 * 2 ** attempt);
    }
  }

  // Windows can briefly lock the db file during antivirus/indexer scans. The
  // queued writer already serialized app writes, so this keeps sync from
  // failing with a random 500 when the atomic rename keeps being blocked.
  await writeFile(targetPath, fallbackPayload, "utf8");
  await unlink(tempPath).catch(() => {});
  if (lastError) console.warn(`[db] fell back after rename failed: ${lastError.code}`);
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
          rankedEntries: formatRankedEntries(user.riotProfile.rankedEntries || []),
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

function formatLiveRiotId(participant) {
  const explicit = cleanText(participant.riotId);
  if (explicit) return explicit;
  const gameName = cleanText(
    participant.riotIdGameName
      || participant.gameName
      || participant.summonerName,
  );
  const tagLine = cleanText(
    participant.riotIdTagline
      || participant.riotIdTagLine
      || participant.tagLine
      || participant.tagline,
  );
  return tagLine ? `${gameName}#${tagLine}` : gameName;
}

function formatSoloQueueRank(entry) {
  if (!entry?.tier || !entry?.rank) return "";
  const lp = Number(entry.leaguePoints || 0);
  return `${entry.tier} ${entry.rank}${Number.isFinite(lp) ? ` ${lp} LP` : ""}`;
}

function formatRankedEntries(entries) {
  return (Array.isArray(entries) ? entries : [])
    .filter((entry) => entry?.queueType && entry?.tier && entry?.rank)
    .map((entry) => ({
      queueType: cleanText(entry.queueType),
      tier: cleanText(entry.tier),
      rank: cleanText(entry.rank),
      leaguePoints: Number(entry.leaguePoints || 0),
      wins: Number(entry.wins || 0),
      losses: Number(entry.losses || 0),
      display: formatSoloQueueRank(entry),
    }));
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

function championNameById(value) {
  const id = cleanText(value);
  if (!id) return "";
  return GAME_DATA.championKeys?.[id] || "Unknown";
}

function normalizeMatchNote(value) {
  const note = cleanText(value);
  return /^Zaimportowano z Riot Match-V5/i.test(note) ? "" : note;
}

function seasonStartTimestamp() {
  return Math.floor(ARENA_SEASON_START_MS / 1000);
}

function parseDateMs(value) {
  const ms = Date.parse(cleanText(value));
  return Number.isFinite(ms) ? ms : 0;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mapWithConcurrency(items, limit, mapper) {
  const source = Array.isArray(items) ? items : [];
  const results = new Array(source.length);
  let cursor = 0;
  const workerCount = Math.min(Math.max(1, limit), source.length);

  async function worker() {
    while (cursor < source.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(source[index], index);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
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
  return stripDiacritics(cleanText(safeDecode(String(value || "")))).toLowerCase();
}

function normalizeLookupKey(value) {
  return stripDiacritics(cleanText(value)).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function stripDiacritics(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
