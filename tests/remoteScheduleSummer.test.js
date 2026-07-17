import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
  appType: "custom"
});
const {
  buildScheduleSignature,
  fetchRemoteSchedule,
  normalizeRemotePayload
} = await server.ssrLoadModule("/src/services/schedule/remoteSchedule.js");

const payload = {
  version: 2,
  semesterStartDate: "2026-07-13",
  updatedAt: "2026-07-16T00:00:00+08:00",
  events: [
    {
      id: "event-1",
      name: "肺炎的诊断及治疗",
      day: "Tuesday",
      weeks: [2],
      startTime: "13:45",
      endTime: "14:25",
      group: null,
      location: "11号楼1楼教室",
      teacher: "魏湘",
      note: ""
    }
  ]
};

test("remote schedule accepts only the authoritative summer root", () => {
  assert.equal(typeof normalizeRemotePayload, "function");
  assert.deepEqual(normalizeRemotePayload(payload), payload);
  assert.throws(
    () => normalizeRemotePayload({ version: 2, schedule: payload.events }),
    /课表数据格式不兼容/
  );
});

test("remote schedule migrates legacy v1 payloads without losing teachers", () => {
  const legacyPayload = {
    ...payload,
    version: 1,
    events: payload.events.map(({ teacher, note: _note, ...event }) => ({
      ...event,
      note: teacher
    }))
  };

  assert.deepEqual(normalizeRemotePayload(legacyPayload), payload);
});

test("schedule signature covers the complete normalized root", () => {
  const signature = buildScheduleSignature(payload);
  assert.equal(signature, JSON.stringify(payload));
  assert.notEqual(signature, buildScheduleSignature({ ...payload, updatedAt: "2026-07-17T00:00:00+08:00" }));
});

test("remote schedule compares updatedAt as absolute timestamps", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const newer = String(url).includes("gcore");
    return new Response(
      JSON.stringify({
        ...payload,
        updatedAt: newer
          ? "2026-07-15T17:00:00Z"
          : "2026-07-16T00:00:00+08:00"
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" }
      }
    );
  };

  try {
    const result = await fetchRemoteSchedule();
    assert.equal(result.status, "updated");
    assert.match(result.sourceUrl, /gcore/);
    assert.equal(result.snapshot.updatedAt, "2026-07-15T17:00:00Z");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test.after(async () => {
  await server.close();
});
