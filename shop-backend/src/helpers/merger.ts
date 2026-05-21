export interface MergeStrategy {
  merge: (base: any, next: any) => any;
}
export function mergeState(
  base: any,
  next: any,
  strategy: Record<string, MergeStrategy>
) {
  const result = { ...base };

  for (const key of Object.keys(next)) {
    const s = strategy[key];

    if (s) {
      result[key] = s.merge(base?.[key], next[key]);
    } else {
      result[key] = next[key];
    }
  }

  return result;
}