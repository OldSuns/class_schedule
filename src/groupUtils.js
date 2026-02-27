export const GROUP_TYPES = {
  A: "A",
  B: "B",
  ALL: "ALL"
};

const normalizeGroupString = (group) => {
  if (!group || typeof group !== "string") return "";
  return group.replace(/\s+/g, "").toUpperCase();
};

export const getGroupType = (group) => {
  const normalized = normalizeGroupString(group);
  if (!normalized) return GROUP_TYPES.ALL;

  const hasA = normalized.includes("A");
  const hasB = normalized.includes("B");

  if (hasA && hasB) return GROUP_TYPES.ALL;
  if (hasA) return GROUP_TYPES.A;
  if (hasB) return GROUP_TYPES.B;
  return GROUP_TYPES.ALL;
};

export const shouldNotifyForGroup = (courseGroup, userGroup) => {
  const courseType = getGroupType(courseGroup);
  if (courseType === GROUP_TYPES.ALL) return true;
  return courseType === userGroup;
};
