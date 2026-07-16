export const GROUP_TYPES = Object.fromEntries(
  Array.from({ length: 7 }, (_, index) => [`G${index + 1}`, `${index + 1}组`])
);

export const SELECTABLE_GROUP_TYPES = Object.values(GROUP_TYPES);

export const getGroupType = (group) => {
  if (typeof group !== "string") return null;
  const normalized = group.trim();
  return SELECTABLE_GROUP_TYPES.includes(normalized) ? normalized : null;
};

export const shouldNotifyForGroup = (courseGroup, userGroup) => {
  if (courseGroup == null || courseGroup === "") return true;
  const courseType = getGroupType(courseGroup);
  if (!courseType) return false;
  if (userGroup == null || userGroup === "") return true;
  return courseType === getGroupType(userGroup);
};
