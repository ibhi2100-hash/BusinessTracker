import { create } from "zustand";

type OfflineEvent = {
  id: string;
  type: string;
  payload: any;
  branchId: string;
  createdAt: string;
  synced: boolean;
};

type SyncState = {
  queue: OfflineEvent[];

  addEvent: (event: OfflineEvent) => void;
  markSynced: (ids: string[]) => void;
};
export const useSyncStore = create<SyncState>((set) => ({
    addEvent(event) {
  // 1. Store locally
  set(state => ({
    queue: [...state.queue, { ...event, synced: false }]
  }));

}))