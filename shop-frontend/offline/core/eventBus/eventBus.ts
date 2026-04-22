
type Listener = (event: any) => void;

const listeners = new Set<Listener>();

export const eventBus = {
    subscribe(fn: Listener) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    },

    emit(event: any){
        for (const fn of listeners) {
            fn(event);
        }
    },
};