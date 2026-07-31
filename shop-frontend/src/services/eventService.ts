import { useBranchStore } from "@/src/store/useBranchStore";
import { nanoid } from "nanoid";
import { InventoryEventType, OpeningEventType } from "@business/shared-types";
import { useInventoryStore } from "../store/inventoryStore";
import { AggregateType } from "@/offline/domain/aggregate";
import { inventoryKey } from "../utils/keygenerator";
import { CommandIntent } from "../BizTru_Karnel/CommandFactory/CommandIntent";
import { ApplicationContext } from "../Composer/context/ApplicationContexts";

export class EventService {
  constructor(
    private readonly app: ApplicationContext
  ){}

  async create(input: CommandIntent<any>){
    const command = 
      await this.app.commandFactory.create(input);

    const kernel = 
      this.app.kernel.execute(command)
  }

  async createProductWithOpeningStock(data: {
    name: string;
    price: number;
    costPrice: number;
    quantity: number;
    mode: "OPENING" | "LIVE";
  }) {
    const productId = nanoid();
    const branchId = useBranchStore.getState().activeBranchId;
  
    if (!branchId) throw new Error("No active branch");

    // 1️⃣ PRODUCT EVENT
    await this.create({
      type: InventoryEventType.PRODUCT_CREATED,
      aggregateId: productId,
      aggregateType: "PRODUCT",

      mode: data.mode,
      payload: {
        id: productId,
        name: data.name,
        price: data.price,
        costPrice: data.costPrice,
      },
    });

    // 2️⃣ INVENTORY EVENT (only if needed)
    if (data.quantity > 0) {
      await this.create({
        type: OpeningEventType.OPENING_INVENTORY_CREATED,

        aggregateId: inventoryKey(productId, branchId), // separate aggregate for inventory
        aggregateType: AggregateType.INVENTORY,
        mode: data.mode,
        payload: {
          id: nanoid(),
          productId,
          quantity: data.quantity,
          costPrice: data.costPrice, // normalized field
        },
      });
    }

    return productId;
  }

   async updateProductSmart(input: ProductUpdateInput) {
  const db = useInventoryStore.getState().productsById[input.productId];
  if (!db) throw new Error("Product not found");
  const branchId = useBranchStore.getState().activeBranchId;
  const key = inventoryKey(input.productId, branchId)
  const events = [];

  // -----------------------------
  // 1. Detect PRODUCT changes
  // -----------------------------
  const productChanged =
  (input.name !== undefined &&
    input.name !== db.name) ||
  (input.price !== undefined &&
    input.price !== db.price) ||
  (input.costPrice !== undefined &&
    input.costPrice !== db.costPrice);

    if (productChanged) { 
      events.push(
        this.create({
          type: InventoryEventType.PRODUCT_UPDATED,
          aggregateId: input.productId,
          aggregateType: AggregateType.PRODUCT,

          mode: "LIVE",
          payload: {
            productId: input.productId,
            name: input.name ?? db.name,
            price: input.price ?? db.price,
            costPrice: input.costPrice ?? db.costPrice,
          },
        })
      );
    }
    
    // -----------------------------
    // 2. Detect INVENTORY changes
    // -----------------------------
    const currentQty = db.quantity ?? 0;
    const delta = input.quantity! - currentQty
    

    if (delta) {
      events.push(
        this.create({
          type: InventoryEventType.INVENTORY_UPDATED,
          aggregateId: key,
          aggregateType: AggregateType.INVENTORY,
          mode: "LIVE",
          payload: {
            productId: input.productId,
            quantityDelta: delta, // delta-based model
          },
        })
      );
    }

console.log(
  "update aggregate",
  `${input.productId}_${useBranchStore.getState().activeBranchId}`
);

  // -----------------------------
  // 3. Execute atomically (sequential dispatch)
  // -----------------------------
  for (const eventPromise of events) {
    await eventPromise;
  }

  return true;
} 

}
