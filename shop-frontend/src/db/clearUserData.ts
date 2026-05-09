// /offline/db/clearUserData.ts

import { useAuthStore } from "@/src/store/useAuthStore";

export async function clearUserData() {
  const user = useAuthStore.getState().user;

  if (!user?.id) {
    console.warn("No user found, skipping DB deletion");
    return;
  }

  const dbName = `business-app-${user.id}`;

  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);

    request.onsuccess = () => {
      console.log("✅ User DB deleted:", dbName);
      resolve();
    };

    request.onerror = () => {
      console.error("❌ Failed to delete DB:", dbName);
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn("⚠️ DB deletion blocked. Close other tabs.");
    };
  });
}