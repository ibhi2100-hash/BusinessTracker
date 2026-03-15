import { loadSession } from "../session/sessionLoader"
import { loadBusiness } from "../business/businessLoader"
import { inventoryLoader } from "../inventory/loadInventory";
import { loadUser } from "../user/loadUser";

let bootstrapped = false;

export type BootstrapResult =
  | "NO_SESSION"
  | "NO_BUSINESS"
  | "READY";

export async function appBootstrap(): Promise<BootstrapResult> {
  if (bootstrapped) return "READY";

  bootstrapped = true;

  // 1️⃣ Load session
  const session = await loadSession();

  if (!session) {
    return "NO_SESSION";
  }
  // Load User
  const user = await loadUser();

  // 2️⃣ Load business
  const business = await loadBusiness();

  if (!business) {
    return "NO_BUSINESS";
  }

  // 3️⃣ Domain hydration
  await inventoryLoader();



  return "READY";
}