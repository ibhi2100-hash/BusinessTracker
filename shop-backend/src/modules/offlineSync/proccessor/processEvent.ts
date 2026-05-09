import { Event } from "../../../domain/event.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { BusinessRepository } from "../../business/repository/business.repository.js";
import { ProductRepository } from "../../products/repository/productRepository.js";
import { InventoryRepository } from "../../inventory/repository/inventoryRepository.js";


const businessRepo = new BusinessRepository();
const productRepo = new ProductRepository();
const inventoryRepo = new InventoryRepository()
export async function HanldeEvent(event: Event, tx: Prisma.TransactionClient) {
    switch(event.type) {
        case "BUSINESS_CREATED":
            return await businessRepo.createBusiness(event, tx);

        case "BUSINESS_ACTIVATION":
            return await businessRepo.activateBusiness(event, tx);
        case "BRANCH_CREATED":
            return  await businessRepo.createBranch(event, tx);

        case "BRANCH_SWITCH":
            return
        
        case "PRODUCT_CREATED":
            return productRepo.createProduct(event, tx)

        case "OPENING_INVENTORY_CREATED":
            

        case "OPENING_INVENTORY_UPDATED":
            return await inventoryRepo.createOrUpdateInventory(event, tx) 

        case "OPENING_INVENTORY_DELETED":
            return

        case "PRODUCT_UPDATED":
            return

        case "PRODUCT_DELETED":
            return
            break;
        case "INVENTORY_ADDED":
            return
            break
        
        case "INVENTORY_UPDATED":
            return
            break
        case "ASSET_ADDED":
            return
            break

        case "ASSET_DISPOSED":
            return
            break
        case "EXPENSES_ADDED":
            return
            break
        
        case "LIABILITY_ADDED":
            return
            break
        case "LIABILITY_REPAYMENT":
            return 
            break

        case "CASH_ADDED":
            return 
            break

        case "CAPITAL_INJECTION":
            return
            break

        case "CAPITAL_WITHDRAWAL":
            return 
            break

        case "OPENING_CAPITAL":
            return 
            break
        case "BRANCH_TRANSFER_OUT":
            return 
            break
        case "BRANCH_TRANSFER_IN":
            return 
            break
        case "SALE_ADDED":
            return 
            break
    }
  }

