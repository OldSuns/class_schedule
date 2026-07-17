import test from "node:test";
import assert from "node:assert/strict";
import { checkForStartupUpdate } from "../src/services/app/startupUpdate.js";

test("startup update check prompts once per day", async () => {
  const values = new Map();
  let requests = 0;
  const options = {
    currentVersion: "2.0.8",
    now: new Date("2026-07-18T08:00:00+08:00").getTime(),
    getStored: async (key) => values.get(key) ?? null,
    setStored: async (key, value) => values.set(key, value),
    checkUpdates: async () => {
      requests += 1;
      return {
        status: "update",
        latestVersion: "2.0.9",
        releaseNotes: "启动更新检查",
        url: "https://example.com/release"
      };
    }
  };

  const [first, duplicate] = await Promise.all([
    checkForStartupUpdate(options),
    checkForStartupUpdate(options)
  ]);
  assert.equal(first.shouldPrompt, true);
  assert.equal(duplicate.shouldPrompt, true);
  assert.equal((await checkForStartupUpdate(options)).reason, "checked-today");
  assert.equal(requests, 1);
});

test("startup update check retries network errors after three minutes", async () => {
  const values = new Map();
  let requests = 0;
  const startedAt = new Date("2026-07-18T08:00:00+08:00").getTime();
  const options = {
    currentVersion: "2.0.8",
    now: startedAt,
    getStored: async (key) => values.get(key) ?? null,
    setStored: async (key, value) => values.set(key, value),
    checkUpdates: async () => {
      requests += 1;
      return { status: "error", message: "network" };
    }
  };

  assert.equal((await checkForStartupUpdate(options)).status, "error");
  assert.equal(
    (await checkForStartupUpdate({ ...options, now: startedAt + 60_000 })).reason,
    "error-cooldown"
  );
  assert.equal(
    (await checkForStartupUpdate({ ...options, now: startedAt + 180_000 })).status,
    "error"
  );
  assert.equal(requests, 2);
});
