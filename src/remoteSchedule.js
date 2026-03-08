import { SCHEDULE_REMOTE_URLS } from "./constants";
import { fetchWithTimeout, isTimeoutError } from "./fetchWithTimeout";
import { normalizeSchedule } from "./scheduleUtils";

const REMOTE_SCHEDULE_REQUEST_TIMEOUT_MS = 10000;

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

export const fetchRemoteSchedule = async ({ meta } = {}) => {
  const request = async (url, headers) =>
    fetchWithTimeout(url, {
      headers,
      cache: "no-store"
    }, REMOTE_SCHEDULE_REQUEST_TIMEOUT_MS);

  const getNetworkErrorMessage = (error) =>
    isTimeoutError(error)
      ? "检查超时，请稍后重试"
      : "网络连接失败或更新源不可达";

  const baseHeaders = { Accept: "application/json" };
  const currentMeta = meta && typeof meta === "object" ? meta : null;

  const buildConditionalHeaders = (url) => {
    if (!currentMeta || currentMeta.sourceUrl !== url) return null;
    if (!currentMeta.etag && !currentMeta.lastModified) return null;
    const headers = { ...baseHeaders };
    if (currentMeta.etag) {
      headers["If-None-Match"] = currentMeta.etag;
    }
    if (currentMeta.lastModified) {
      headers["If-Modified-Since"] = currentMeta.lastModified;
    }
    return headers;
  };

  const fetchFromUrl = async (url) => {
    const conditionalHeaders = buildConditionalHeaders(url);
    let response = null;

    try {
      response = await request(url, conditionalHeaders || baseHeaders);
    } catch (error) {
      // 条件请求失败时回退到普通 GET，规避跨源切换后的缓存头兼容问题
      if (!conditionalHeaders) {
        return { status: "error", message: getNetworkErrorMessage(error) };
      }
      try {
        response = await request(url, baseHeaders);
      } catch (fallbackError) {
        return {
          status: "error",
          message: getNetworkErrorMessage(fallbackError)
        };
      }
    }

    if (response.status === 304) {
      return { status: "not-modified", sourceUrl: url };
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
        sourceUrl: url
      };
      return { status: "updated", snapshot, meta, sourceUrl: url };
    } catch (error) {
      return { status: "error", message: "课表数据结构不正确" };
    }
  };

  let lastError = null;
  for (const url of SCHEDULE_REMOTE_URLS) {
    const result = await fetchFromUrl(url);
    if (result.status === "error") {
      lastError = result;
      continue;
    }
    return result;
  }

  return {
    status: "error",
    message: lastError?.message || "网络连接失败或更新源不可达"
  };
};
