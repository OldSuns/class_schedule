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
  const request = async (headers) =>
    fetch(SCHEDULE_REMOTE_URL, {
      headers,
      cache: "no-store"
    });

  const baseHeaders = { Accept: "application/json" };
  const conditionalHeaders = { ...baseHeaders };
  if (etag) {
    conditionalHeaders["If-None-Match"] = etag;
  }
  if (lastModified) {
    conditionalHeaders["If-Modified-Since"] = lastModified;
  }

  let response = null;
  try {
    response = await request(conditionalHeaders);
  } catch (error) {
    // 条件请求失败时回退到普通 GET，规避跨源切换后的缓存头兼容问题
    if (!etag && !lastModified) {
      return { status: "error", message: "网络连接失败或更新源不可达" };
    }
    try {
      response = await request(baseHeaders);
    } catch (fallbackError) {
      return { status: "error", message: "网络连接失败或更新源不可达" };
    }
  }

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
      signature,
      sourceUrl: SCHEDULE_REMOTE_URL
    };
    return { status: "updated", snapshot, meta };
  } catch (error) {
    return { status: "error", message: "课表数据结构不正确" };
  }
};
