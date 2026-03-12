import { SaleService } from "../../sales/service/sale.service.js";
import { InventoryService } from "../../inventory/service/inventory.service.js";
import { ProductService } from "../../products/service/product.service.js";
import { AssetService } from "../../assets/service/asset.service.js";
import { LiabilityService } from "../../liability/service/liability.service.js";



export class OfflineSyncService {
  constructor(
    private saleService: SaleService,
    private productService: ProductService,
    private assetService: AssetService,
    private liabilityService: LiabilityService,
  ) {}

  async processEvent(event: { type: string; payload: any }) {
    switch(event.type) {
        case "SALE_ADDED":
            return this.saleService.createSale(
            event.payload,
            event.payload.businessId,
            event.payload.branchId
            );

        case "INVENTORY_ADDED":
            return this.productService.createProduct(
                event.payload.items,
                event.payload.businessId,
                event.payload.branchId,
            
            );

        case "INVENTORY_UPDATED":
            return this.productService.updateProductPartial(
                event.payload.productId,
                event.payload.data,
                event.payload.businessId,
                event.payload.branchId,
            
            );
        case "ASSET_ADDED":
            return this.assetService.createAsset(
                event.payload.businessId,
                event.payload.branchId,
                event.payload
            )
        
        case "ASSET_DISPOSED":
            return this.assetService.disposeAsset(
                event.payload.assetId,
                event.payload.businessId,
                event.payload.branchId,
                event.payload
            )
        case "LIABILITY_ADDED":
            return this.liabilityService.createLiability(
                event.payload.businessId,
                event.payload.branchId,
                event.payload
            )

        case "LIABILITY_REPAYMENT":
            return this.liabilityService.repayLiability(
                event.payload.liabilityId,
                event.payload.businessId,
                event.payload.branchId,
                event.payload
            )

        

        

      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }
  }
}