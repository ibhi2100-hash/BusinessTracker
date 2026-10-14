export function toPrismaDate(
  timestamp: number | null,
): Date | null {
  return timestamp === null
    ? null
    : new Date(timestamp);
}