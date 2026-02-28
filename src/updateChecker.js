import { GITHUB_RELEASES_API_LATEST } from "./constants";

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

export const checkForUpdates = async (currentVersion) => {
  try {
    const response = await fetch(GITHUB_RELEASES_API_LATEST, {
      headers: {
        Accept: "application/vnd.github+json"
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
      return {
        status: "update",
        latestVersion,
        url: data.html_url,
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
