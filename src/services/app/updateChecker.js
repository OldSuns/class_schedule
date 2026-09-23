import {
  GITHUB_RELEASES_API_LIST,
  GITHUB_RELEASES_API_LATEST,
  GITHUB_RELEASES_URL
} from "../../config/constants";
import { fetchWithTimeout, isTimeoutError } from "../platform/fetchWithTimeout";

const UPDATE_REQUEST_TIMEOUT_MS = 10000;
const RELEASE_LIST_PAGE_SIZE = 20;
const RELEASE_REQUEST_HEADERS = {
  Accept: "application/json"
};

// 统一版本格式：去掉前缀 v 与构建/预发布标记
const normalizeVersion = (input) => {
  if (!input) return "";
  return String(input)
    .trim()
    .replace(/^v/i, "")
    .split(/[+-]/)[0];
};

const parseVersion = (version) => {
  const normalized = normalizeVersion(version);
  if (!normalized) return [];
  return normalized.split(".").map((part) => {
    const num = Number(part.replace(/[^\d]/g, ""));
    return Number.isNaN(num) ? 0 : num;
  });
};

// 按语义版本逐段比较（仅数字）
const compareVersions = (current, latest) => {
  const currentParts = parseVersion(current);
  const latestParts = parseVersion(latest);
  const length = Math.max(currentParts.length, latestParts.length);
  for (let i = 0; i < length; i += 1) {
    const a = currentParts[i] ?? 0;
    const b = latestParts[i] ?? 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
};

const isApkAsset = (asset) => {
  const name = String(asset?.name || asset?.filename || "").toLowerCase();
  const url = String(
    asset?.browser_download_url ||
      asset?.download_url ||
      asset?.url ||
      ""
  ).toLowerCase();
  return name.endsWith(".apk") || /\.apk(\?|#|$)/i.test(url);
};

const getAssetUrl = (asset) =>
  asset?.browser_download_url || asset?.download_url || asset?.url || "";

const normalizeReleaseNotes = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim();
};

const getReleaseIdentifier = (release) =>
  release?.tag_name || release?.name || "";

const getReleaseVersion = (release) =>
  normalizeVersion(getReleaseIdentifier(release));

const getReleaseUrl = (release) => release?.html_url || GITHUB_RELEASES_URL;

const toReleaseDetails = (release, isFallback = false) => ({
  releaseVersion: getReleaseVersion(release),
  releaseUrl: getReleaseUrl(release),
  releaseNotes: normalizeReleaseNotes(
    release?.body || release?.description || ""
  ),
  releasePublishedAt: String(release?.published_at || release?.created_at || ""),
  releaseIsFallback: isFallback
});

const fetchReleaseJson = async (url) => {
  const response = await fetchWithTimeout(
    url,
    { headers: RELEASE_REQUEST_HEADERS },
    UPDATE_REQUEST_TIMEOUT_MS
  );

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.code = "http";
    error.status = response.status;
    throw error;
  }

  try {
    return await response.json();
  } catch (error) {
    const parseError = new Error("invalid-json");
    parseError.code = "parse";
    throw parseError;
  }
};

const fetchReleaseList = async () => {
  const url =
    `${GITHUB_RELEASES_API_LIST}?page=1&per_page=${RELEASE_LIST_PAGE_SIZE}`;
  const data = await fetchReleaseJson(url);
  return Array.isArray(data) ? data : [];
};

const findReleaseByVersion = (releases, version) => {
  const targetVersion = normalizeVersion(version);
  if (!targetVersion) return null;
  return releases.find((release) => getReleaseVersion(release) === targetVersion) || null;
};

const resolveReleaseDetails = async ({
  latestRelease,
  currentVersion,
  latestVersion,
  compare
}) => {
  if (!latestRelease) return null;

  if (compare < 0) {
    return toReleaseDetails(latestRelease, false);
  }

  const currentNormalized = normalizeVersion(currentVersion);
  if (!currentNormalized || currentNormalized === latestVersion) {
    return toReleaseDetails(latestRelease, false);
  }

  try {
    const releases = await fetchReleaseList();
    const matchedRelease = findReleaseByVersion(releases, currentNormalized);
    if (matchedRelease) {
      return toReleaseDetails(matchedRelease, false);
    }
  } catch (error) {
    // 说明查询失败时回退到 latest release，不影响主流程。
  }

  return toReleaseDetails(latestRelease, true);
};

const pickApkUrl = (data, latestVersion) => {
  const assets = [];
  if (Array.isArray(data?.assets)) assets.push(...data.assets);
  if (Array.isArray(data?.attachments)) assets.push(...data.attachments);

  if (assets.length === 0) return "";

  const versionToken = String(latestVersion || "").toLowerCase();
  const candidates = assets.filter(isApkAsset);
  if (candidates.length === 0) return "";

  const scored = candidates
    .map((asset, index) => {
      const name = String(asset?.name || asset?.filename || "").toLowerCase();
      const url = String(getAssetUrl(asset)).toLowerCase();
      let score = 0;
      if (versionToken) {
        if (name.includes(`v${versionToken}`) || url.includes(`v${versionToken}`)) {
          score += 2;
        } else if (name.includes(versionToken) || url.includes(versionToken)) {
          score += 1;
        }
      }
      if (name.includes("class_schedule") || url.includes("class_schedule")) {
        score += 1;
      }
      return { asset, score, index };
    })
    .sort((a, b) => (b.score - a.score) || (a.index - b.index));

  const best = scored[0]?.asset;
  const url = String(getAssetUrl(best) || "");
  if (!/^https?:\/\//i.test(url)) return "";
  if (!/\.apk(\?|#|$)/i.test(url)) return "";
  return url;
};

export const checkForUpdates = async (
  currentVersion,
  { includeReleaseNotes = false } = {}
) => {
  try {
    const data = await fetchReleaseJson(GITHUB_RELEASES_API_LATEST);

    const latestTag = data.tag_name || data.name || "";
    const latestVersion = normalizeVersion(latestTag);
    const compare = compareVersions(currentVersion, latestVersion);

    if (!latestVersion) {
      return {
        status: "error",
        message: "未获取到版本信息"
      };
    }

    const releaseDetails = includeReleaseNotes
      ? await resolveReleaseDetails({
          latestRelease: data,
          currentVersion,
          latestVersion,
          compare
        })
      : null;

    if (compare < 0) {
      const apkUrl = pickApkUrl(data, latestVersion);
      return {
        status: "update",
        latestVersion,
        url: data.html_url || GITHUB_RELEASES_URL,
        apkUrl,
        message: `发现新版本 v${latestVersion}`,
        ...(releaseDetails || {})
      };
    }

    return {
      status: "latest",
      latestVersion,
      message: `当前已是最新版本 v${latestVersion}`,
      ...(releaseDetails || {})
    };
  } catch (error) {
    if (isTimeoutError(error)) {
      return {
        status: "error",
        message: "检查超时，请稍后重试"
      };
    }
    if (error?.code === "parse") {
      return {
        status: "error",
        message: "版本信息解析失败"
      };
    }
    if (error?.code === "http") {
      return {
        status: "error",
        message: `检查失败（HTTP ${error.status}）`
      };
    }
    return {
      status: "error",
      message: "检查失败，请稍后重试"
    };
  }
};
