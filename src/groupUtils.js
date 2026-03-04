export const GROUP_TYPES = {
  G6A: "6A",
  G6B: "6B",
  G7C: "7C",
  G7D: "7D",
  G6ALL: "6ALL",
  G7ALL: "7ALL",
  ALL: "ALL"
};

export const SELECTABLE_GROUP_TYPES = [
  GROUP_TYPES.G6A,
  GROUP_TYPES.G6B,
  GROUP_TYPES.G7C,
  GROUP_TYPES.G7D
];

const normalizeGroupString = (group) => {
  if (!group || typeof group !== "string") return "";
  return group.replace(/\s+/g, "").toUpperCase();
};

export const getGroupType = (group) => {
  const normalized = normalizeGroupString(group);
  if (!normalized) return GROUP_TYPES.ALL;

  const has6A = normalized.includes("6班A组") || normalized === "A组";
  const has6B = normalized.includes("6班B组") || normalized === "B组";
  const has7C = normalized.includes("7班C组");
  const has7D = normalized.includes("7班D组");
  const hasCombined6 =
    normalized.includes("6班A、B组") || normalized.includes("6班A/B组");
  const hasCombined7 =
    normalized.includes("7班C、D组") || normalized.includes("7班C/D组");

  if (hasCombined6 || (has6A && has6B)) {
    return GROUP_TYPES.G6ALL;
  }
  if (hasCombined7 || (has7C && has7D)) {
    return GROUP_TYPES.G7ALL;
  }
  if (has6A) {
    return GROUP_TYPES.G6A;
  }
  if (has6B) {
    return GROUP_TYPES.G6B;
  }
  if (has7C) {
    return GROUP_TYPES.G7C;
  }
  if (has7D) {
    return GROUP_TYPES.G7D;
  }

  return GROUP_TYPES.ALL;
};

export const shouldNotifyForGroup = (courseGroup, userGroup) => {
  if (!userGroup || !SELECTABLE_GROUP_TYPES.includes(userGroup)) return true;
  const courseType = getGroupType(courseGroup);
  if (courseType === GROUP_TYPES.ALL) return true;
  if (courseType === GROUP_TYPES.G6ALL) {
    return userGroup === GROUP_TYPES.G6A || userGroup === GROUP_TYPES.G6B;
  }
  if (courseType === GROUP_TYPES.G7ALL) {
    return userGroup === GROUP_TYPES.G7C || userGroup === GROUP_TYPES.G7D;
  }
  return courseType === userGroup;
};
