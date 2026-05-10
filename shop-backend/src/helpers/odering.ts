export function deterministicSort(events: DomainEvent[]) {
  return events.sort((a, b) => {
    const aSum = Object.values(a.vectorClock).reduce((x, y) => x + y, 0);
    const bSum = Object.values(b.vectorClock).reduce((x, y) => x + y, 0);

    if (aSum !== bSum) return aSum - bSum;

    if (a.deviceId !== b.deviceId) {
      return a.deviceId < b.deviceId ? -1 : 1;
    }

    return a.version - b.version;
  });
}