import { STORAGE_KEYS } from "../../config/constants.js";
import { getTodayKey, hasElapsed } from "../../utils/schedule/dateUtils.js";
import { getItem, setItem } from "../../../storage.js";
import { checkForUpdates } from "./updateChecker.js";

export const STARTUP_UPDATE_ERROR_RETRY_INTERVAL_MS = 3 * 60 * 1000;

let inFlightCheck = null;

const runStartupUpdateCheck = async ({
  currentVersion,
  now = Date.now(),
  getStored = getItem,
  setStored = setItem,
  checkUpdates = checkForUpdates
}) => {
  const today = getTodayKey(new Date(now));
  const [lastCheckDate, lastErrorRaw, lastPromptDate] = await Promise.all([
    getStored(STORAGE_KEYS.UPDATE_LAST_CHECK_DATE),
    getStored(STORAGE_KEYS.UPDATE_LAST_ERROR_AT),
    getStored(STORAGE_KEYS.UPDATE_LAST_TOAST_DATE)
  ]);

  if (lastCheckDate === today) {
    return { status: "skipped", reason: "checked-today", shouldPrompt: false };
  }

  if (
    !hasElapsed(
      Number(lastErrorRaw),
      STARTUP_UPDATE_ERROR_RETRY_INTERVAL_MS,
      now
    )
  ) {
    return { status: "skipped", reason: "error-cooldown", shouldPrompt: false };
  }

  const result = await checkUpdates(currentVersion, {
    includeReleaseNotes: true
  });

  if (result?.status === "update" || result?.status === "latest") {
    await Promise.all([
      setStored(STORAGE_KEYS.UPDATE_LAST_CHECK_DATE, today),
      setStored(STORAGE_KEYS.UPDATE_LAST_ERROR_AT, "")
    ]);
  } else if (result?.status === "error") {
    await setStored(STORAGE_KEYS.UPDATE_LAST_ERROR_AT, String(now));
  }

  const shouldPrompt = result?.status === "update" && lastPromptDate !== today;
  if (shouldPrompt) {
    await setStored(STORAGE_KEYS.UPDATE_LAST_TOAST_DATE, today);
  }

  return { ...result, shouldPrompt };
};

export const checkForStartupUpdate = (options) => {
  if (inFlightCheck) return inFlightCheck;
  inFlightCheck = runStartupUpdateCheck(options).finally(() => {
    inFlightCheck = null;
  });
  return inFlightCheck;
};
