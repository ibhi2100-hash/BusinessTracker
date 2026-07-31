import { AccountingService } from "./AccountingService";
import { CustomerService } from "./customerService";
import { InventoryService } from "./InventoryService";
import { ProductService } from "./ProductService";
import { PurchaseService } from "./PurchaseService";
import { SalesService } from "./SalesService";
import { SupplierService } from "./SupplierService";

export  interface BusinessServiceRegistry {
    readonly inventory: InventoryService;

    readonly product: ProductService;

    readonly sales: SalesService;

    readonly purchase: PurchaseService;

    readonly customer: CustomerService;

    readonly supplier: SupplierService;

    readonly accounting: AccountingService;
}