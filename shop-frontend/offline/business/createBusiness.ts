import { getRecord } from "../db/helpers";
import { TABLES } from "../db/schema";
import { dispatchEvent } from "../events/eventDispatcher";
import { useBusinessStore } from "@/store/businessStore";
import { BusinessEventTypes } from "../events/eventGroups/businessEvents";
import { createEvent } from "../events/eventFactory";
import { useBranchStore } from "@/store/useBranchStore";
import { createEntity } from "../entities/entityFactory";

export async function createBusiness(input: any, branchData: any) {
  const session = await getRecord(TABLES.SESSION, "active");

  if (!session?.userId) {
    throw new Error("No active session");
  }

  // 1️⃣ Create entities
  const business = createEntity(input);
  const branch = createEntity({
    ...branchData,
    businessId: business.id,
  });

  // 2️⃣ Create event (single source of truth)
  const event = await createEvent(
    BusinessEventTypes.BUSINESS_CREATED,
    session.userId,
    business.id,
    branch.id,
    { business, branch },
    "pending"
  );

  // 3️⃣ Dispatch event (writes to DB via reducer)
  await dispatchEvent(event);

  // 4️⃣ Optimistic UI update (optional but recommended)
  useBusinessStore.getState().setBusiness(business);

  useBranchStore.getState().setContext({
    businessName: business.name,
    branches: [branch],
    role: "ADMIN",
    activeBranchId: branch.id,
  });

  return business;
}