export const trimObjectEmptyProperties = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
