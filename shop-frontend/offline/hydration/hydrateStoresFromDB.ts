import { hydrateStores } from "./hydrationStore";
import { loadUser } from "@/offline/user/userRepository";
import { loadSession } from "@/offline/session/sessionRepository";

export async function hydrateStoresFromDB() {
  const user = await loadUser();
  const session = await loadSession();

  if (!user || !session) return;

  hydrateStores({
    user,
    accessToken: session.accessToken,
    expiresAt: session.expiresAt,
  });
}