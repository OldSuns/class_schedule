import { SCHEDULE_REMOTE_URLS } from "../../config/constants";
import { fetchWithTimeout, isTimeoutError } from "../platform/fetchWithTimeout";
import { normalizeSchedulePayload } from "../../utils/schedule/eventUtils";

const REMOTE_SCHEDULE_REQUEST_TIMEOUT_MS = 10000;

export const buildScheduleSignature = (schedule) =>
  JSON.stringify(normalizeSchedulePayload(schedule));

export const isScheduleNewer = (candidate, current) =>
  Date.parse(candidate?.updatedAt) > Date.parse(current?.updatedAt);

export const normalizeRemotePayload = normalizeSchedulePayload;

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
      const signature = buildScheduleSignature(snapshot);
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

  // 并发请求所有源，按 payload.updatedAt 选最新的，避免被任一 CDN 缓存延迟卡住。
  // 304 结果的「比较时间」回填为缓存里这个源上次的 updatedAt——条件请求只发往
  // currentMeta.sourceUrl，所以 304 只可能来自该源。
  const results = await Promise.all(
    SCHEDULE_REMOTE_URLS.map((url) => fetchFromUrl(url))
  );

  const successful = [];
  let firstError = null;
  results.forEach((result, index) => {
    if (result.status === "error") {
      if (!firstError) firstError = result;
      return;
    }
    let comparableUpdatedAt = "";
    if (result.status === "updated") {
      comparableUpdatedAt = result.snapshot?.updatedAt || "";
    } else if (result.status === "not-modified") {
      comparableUpdatedAt = currentMeta?.updatedAt || "";
    }
    successful.push({ result, index, comparableUpdatedAt });
  });

  if (successful.length === 0) {
    return {
      status: "error",
      message: firstError?.message || "网络连接失败或更新源不可达"
    };
  }

  // 按绝对时间比较，避免不同时区偏移的 ISO 字符串字典序误判；平手时按源顺序优先。
  successful.sort((a, b) => {
    if (a.comparableUpdatedAt !== b.comparableUpdatedAt) {
      return Date.parse(b.comparableUpdatedAt) - Date.parse(a.comparableUpdatedAt);
    }
    return a.index - b.index;
  });

  return successful[0].result;
};
