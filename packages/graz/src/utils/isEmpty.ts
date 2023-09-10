export const isEmpty = <T>(v: Record<string, T> | null | undefined) => {
  if (!v) return true;
  return Object.keys(v).length === 0;
};
