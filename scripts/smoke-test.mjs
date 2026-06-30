import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9327;
const profileDir = join(root, "work", `edge-profile-${Date.now()}`);
const appUrl = "http://127.0.0.1:4173/";
const storageKey = "arenatracker.matches.v1";
const errors = [];

await mkdir(profileDir, { recursive: true });

const browserProcess = spawn(
  edgePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);

try {
  const page = await waitForPage();
  const cdp = await connectCdp(page.webSocketDebuggerUrl);

  cdp.on("Runtime.exceptionThrown", (event) => {
    errors.push(event.exceptionDetails?.text || "Runtime exception");
  });

  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  const loadPromise = cdp.waitFor("Page.loadEventFired");
  await cdp.send("Page.navigate", { url: appUrl });
  await loadPromise;
  await evalPage(cdp, `localStorage.removeItem(${JSON.stringify(storageKey)})`);
  await evalPage(cdp, `document.querySelector("#seedSampleButton").click()`);
  await evalPage(cdp, `new Promise((resolve) => setTimeout(resolve, 150))`, true);

  const seededCount = await evalPage(
    cdp,
    `JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})).length`,
  );
  assert(seededCount === 8, `Expected 8 demo matches, got ${seededCount}`);

  const progressText = await evalPage(cdp, `document.querySelector("#progressCounter").textContent`);
  assert(progressText.startsWith("2 / "), `Unexpected progress: ${progressText}`);

  const metrics = await evalPage(
    cdp,
    `[...document.querySelectorAll(".metric-card")].map((card) => card.innerText)`,
  );
  assert(metrics[0].includes("8"), "Matches metric did not update");
  assert(metrics[1].includes("2"), "Wins metric did not update");
  assert(metrics[2].includes("2"), "Won champions metric did not update");
  const dashboardPickerCount = await evalPage(
    cdp,
    `document.querySelector('#dashboardView #championPicker') == null`,
  );
  assert(dashboardPickerCount, "Dashboard should not contain champion search");

  await evalPage(cdp, `location.hash = "champions"`);
  await evalPage(cdp, `new Promise((resolve) => setTimeout(resolve, 100))`, true);
  const collectionText = await evalPage(cdp, `document.querySelector("#championCollection").innerText`);
  assert(collectionText.includes("Vi"), "Won champion Vi missing from collection");
  assert(collectionText.includes("Kayn"), "Won champion Kayn missing from collection");
  assert(!collectionText.includes("brak wygranej"), "Collection should only list won champions");
  const collectionIconCount = await evalPage(
    cdp,
    `document.querySelectorAll("#championCollection .champion-icon").length`,
  );
  assert(collectionIconCount === 2, `Expected 2 won champion icons, got ${collectionIconCount}`);

  await evalPage(cdp, `document.querySelector("#championPickerButton").click()`);
  const allOptionHasAllText = await evalPage(
    cdp,
    `document.querySelector("#championFilterIcon").textContent.trim()`,
  );
  assert(allOptionHasAllText === "", "All-wins picker icon should not render ALL text");
  const pickerIconCount = await evalPage(
    cdp,
    `document.querySelectorAll("#championPickerMenu .champion-icon").length`,
  );
  assert(pickerIconCount === 2, `Expected 2 won champion option icons, got ${pickerIconCount}`);
  await evalPage(cdp, `document.querySelector('[data-champion="Vi"]').click()`);
  const filteredCollectionText = await evalPage(cdp, `document.querySelector("#championCollection").innerText`);
  assert(filteredCollectionText.includes("Vi"), "Filtered collection should contain Vi");
  assert(!filteredCollectionText.includes("Kayn"), "Filtered collection should hide Kayn");

  await evalPage(cdp, `document.querySelector("#accountMenuButton").click()`);
  const accountOverlayOpen = await evalPage(
    cdp,
    `document.querySelector("#accountOverlay").classList.contains("is-open")`,
  );
  assert(accountOverlayOpen, "Account button should open the account modal");
  const profileHidden = await evalPage(
    cdp,
    `document.querySelector("#profilePanel").classList.contains("is-hidden")`,
  );
  assert(profileHidden, "Riot profile panel should stay hidden while logged out");
  await evalPage(cdp, `document.querySelector('[data-auth-switch="reset"]').click()`);
  const resetVisible = await evalPage(
    cdp,
    `document.querySelector('#resetPasswordForm').classList.contains('is-visible')`,
  );
  assert(resetVisible, "Reset password tab did not become visible");

  if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
  console.log("Smoke test passed: demo seed, progress, champion collection and account modal.");
} finally {
  browserProcess.kill();
}

async function waitForPage() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const pages = await response.json();
      const page = pages.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      await delay(100);
    }
  }
  throw new Error("Timed out waiting for headless Edge.");
}

function connectCdp(url) {
  const socket = new WebSocket(url);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  socket.addEventListener("message", (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) reject(new Error(payload.error.message));
      else resolve(payload.result);
      return;
    }

    const callbacks = listeners.get(payload.method) || [];
    callbacks.forEach((callback) => callback(payload.params || {}));
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      resolve({
        on(method, callback) {
          listeners.set(method, [...(listeners.get(method) || []), callback]);
        },
        send(method, params = {}) {
          const id = nextId;
          nextId += 1;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((methodResolve, methodReject) => {
            pending.set(id, { resolve: methodResolve, reject: methodReject });
          });
        },
        waitFor(method) {
          return new Promise((waitResolve) => {
            const once = (params) => {
              waitResolve(params);
              listeners.set(
                method,
                (listeners.get(method) || []).filter((callback) => callback !== once),
              );
            };
            listeners.set(method, [...(listeners.get(method) || []), once]);
          });
        },
      });
    });
    socket.addEventListener("error", () => reject(new Error("Failed to connect to CDP.")));
  });
}

async function evalPage(cdp, expression, awaitPromise = false) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }
  return result.result?.value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
