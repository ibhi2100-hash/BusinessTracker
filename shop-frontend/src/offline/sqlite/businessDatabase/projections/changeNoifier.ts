// offline/projections/changeNotifier.ts
type Listener = (tables: string[]) => void;

const listeners = new Set<Listener>();

export const changeNotifier = {
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  notify(tables: string[]) {
    listeners.forEach(fn => fn(tables));
  }
};