import {
  GITHUB_RELEASES_API_LATEST,
  GITHUB_RELEASES_URL
} from "./constants";

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

export const checkForUpdates = async (currentVersion) => {
  try {
    const response = await fetch(GITHUB_RELEASES_API_LATEST, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return {
        status: "error",
        message: `检查失败（HTTP ${response.status}）`
      };
    }

    const data = await response.json();
    const latestTag = data.tag_name || data.name || "";
    const latestVersion = normalizeVersion(latestTag);
    const compare = compareVersions(currentVersion, latestVersion);

    if (!latestVersion) {
      return {
        status: "error",
        message: "未获取到版本信息"
      };
    }

    if (compare < 0) {
      const apkUrl = pickApkUrl(data, latestVersion);
      return {
        status: "update",
        latestVersion,
        url: data.html_url || GITHUB_RELEASES_URL,
        apkUrl,
        message: `发现新版本 v${latestVersion}`
      };
    }

    return {
      status: "latest",
      latestVersion,
      message: `当前已是最新版本 v${latestVersion}`
    };
  } catch (error) {
    return {
      status: "error",
      message: "检查失败，请稍后重试"
    };
  }
};
