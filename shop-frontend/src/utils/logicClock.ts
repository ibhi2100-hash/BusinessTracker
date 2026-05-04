let localClock = 0;

export function getNextLogicClock() {
  localClock += 1;
  return localClock;
}