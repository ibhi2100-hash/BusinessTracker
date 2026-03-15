import { getRecord } from "../db/helpers";
import { TABLES } from "../db/schema";
import { useAuthStore } from "@/store/useAuthStore";

export async function hydrateZustandStore() {
  // Implementation for hydrating the Zustand store
  const session = await getRecord(TABLES.SESSION, "active")
    if(session) {
        const user = await getRecord(TABLES.USER, session.userId)

        useAuthStore.getState().setLogin(
            user,
            session.accessToken,
            session.expiresAt
        )

    }
    useAuthStore.getState().setHydrated(true)

}