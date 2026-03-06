import { SCHEDULE_REMOTE_URL } from "./constants";
import { normalizeSchedule } from "./scheduleUtils";

export const buildScheduleSignature = (schedule) =>
  JSON.stringify(Array.isArray(schedule) ? schedule : []);

const normalizeRemotePayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("invalid-payload");
  }
  if (!Array.isArray(payload.schedule)) {
    throw new Error("invalid-schedule");
  }
  const schedule = normalizeSchedule(payload.schedule);
  return {
    version: Number(payload.version) || 1,
    updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : "",
    schedule
  };
};

export const fetchRemoteSchedule = async ({ etag, lastModified } = {}) => {
  const headers = {
    Accept: "application/json"
  };
  if (etag) {
    headers["If-None-Match"] = etag;
  }
  if (lastModified) {
    headers["If-Modified-Since"] = lastModified;
  }

  const response = await fetch(SCHEDULE_REMOTE_URL, {
    headers,
    cache: "no-store"
  });

  if (response.status === 304) {
    return { status: "not-modified" };
  }

  if (!response.ok) {
    return {
      status: "error",
      message: `检查失败（HTTP ${response.status}）`
    };
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    return { status: "error", message: "课表数据解析失败" };
  }

  try {
    const snapshot = normalizeRemotePayload(payload);
    const signature = buildScheduleSignature(snapshot.schedule);
    const meta = {
      etag: response.headers.get("etag") || "",
      lastModified: response.headers.get("last-modified") || "",
      updatedAt: snapshot.updatedAt || "",
      signature
    };
    return { status: "updated", snapshot, meta };
  } catch (error) {
    return { status: "error", message: "课表数据结构不正确" };
  }
};
