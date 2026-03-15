import { addRecord, getRecord } from "../db/helpers";
import { TABLES } from "../db/schema";
import { dispatchEvent } from "../events/eventDispatcher";
import { useBusinessStore } from "@/store/businessStore";
import { BusinessEventTypes } from "../events/eventGroups/businessEvents";
import { createEvent } from "../events/eventFactory";
import { useBranchStore } from "@/store/useBranchStore";
import { createEntity } from "../entities/entityFactory";

export async function createBusiness(input: any, branchData: any) {

  const business = createEntity(input);

  const businessId = business.id;

  const branch = createEntity({
    ...branchData,
    businessId
  });
const branchId = branch.id;
  const session  = await getRecord(TABLES.SESSION, "active")
  // 1️⃣ Save to IndexedDB
  await addRecord(TABLES.BUSINESS, business)
  await addRecord(TABLES.BRANCHES, branch)

 const  event = await createEvent(BusinessEventTypes.BUSINESS_CREATED, session.userId, businessId, branchId, { business, branch }, "pending")

  // 2️⃣ Dispatch event
  await dispatchEvent(event)

  // 3️⃣ Update Zustand store
  useBusinessStore.getState().setBusiness(business)
  useBranchStore.getState().setContext({
        businessName: business.name,
        branches: [branch],
        role: "ADMIN",
        activeBranchId: branchId,
  })

  return business
}