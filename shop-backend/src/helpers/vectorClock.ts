export type VectorClock = Record<string, number>;

export function compareClocks(
  a: VectorClock,
  b: VectorClock
): "BEFORE" | "AFTER" | "CONCURRENT" {
  let aBefore = false;
  let bBefore = false;

  for (const deviceId of Object.keys({ ...a, ...b })) {
    const aVersion = a[deviceId] ?? 0;
    const bVersion = b[deviceId] ?? 0;

    if (aVersion < bVersion) {
      aBefore = true;
    } else if (aVersion > bVersion) {
      bBefore = true;
    }
  }

  if (aBefore && !bBefore) {
    return "BEFORE";
  } else if (!aBefore && bBefore) {
    return "AFTER";
  } else {
    return "CONCURRENT";
  }
}

export function incrementClock(
  clock: VectorClock,
  deviceId: string
): VectorClock {
  return {
    ...clock,
    [deviceId]: (clock[deviceId] ?? 0) + 1,
  };
}