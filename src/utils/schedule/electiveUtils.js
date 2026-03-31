import { ELECTIVE_OPTIONS } from "../../config/constants";
import { shouldNotifyForGroup } from "./groupUtils";

const KNOWN_ELECTIVE_IDS = new Set(
  ELECTIVE_OPTIONS.map((option) => option.value)
);

export const normalizeElectives = (electives) => {
  const values = Array.isArray(electives) ? electives : [];
  const normalized = [];
  const seen = new Set();

  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed || !KNOWN_ELECTIVE_IDS.has(trimmed)) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return ELECTIVE_OPTIONS.map((option) => option.value).filter((value) =>
    normalized.includes(value)
  );
};

export const getCourseEligibleElectives = (electives) => {
  const normalized = normalizeElectives(electives);
  return normalized.length > 0 ? normalized : null;
};

export const shouldIncludeForElectives = (
  courseElectives,
  selectedElectives
) => {
  const eligibleElectives = getCourseEligibleElectives(courseElectives);
  if (!eligibleElectives) return true;

  const normalizedSelectedElectives = normalizeElectives(selectedElectives);
  if (normalizedSelectedElectives.length === 0) return false;

  return eligibleElectives.some((value) =>
    normalizedSelectedElectives.includes(value)
  );
};

export const shouldIncludeCourseForAudience = (
  course,
  userGroup,
  selectedElectives
) =>
  shouldNotifyForGroup(course?.group, userGroup) &&
  shouldIncludeForElectives(course?.electives, selectedElectives);

export const getElectiveLabel = (value) =>
  ELECTIVE_OPTIONS.find((option) => option.value === value)?.label || value;
