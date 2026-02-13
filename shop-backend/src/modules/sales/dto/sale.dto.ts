import { Payment } from "../entity/Payment.entity.js";
import { SaleItemDto } from "./saleItem.dto.js"

export interface SaleDto {
    items: SaleItemDto[];
    payments: Payment[];
}