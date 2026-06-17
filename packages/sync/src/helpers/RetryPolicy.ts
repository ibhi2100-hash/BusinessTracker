export function isRetryable(message: string): boolean {

  if (message.includes("validation")) return false;

  if (message.includes("duplicate")) return false;

  if (message.includes("network")) return true;

  return true;
}