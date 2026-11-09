import { AggregateType } from "../../../../../offline/domain/aggregate"; 
import type{ CommandIntent } from "../../../../BizTru_Karnel/CommandFactory/CommandIntent"; 
import { BusinessManager } from "../../../../Composer/BusinessManager"; 
import type{ ProductBarcodeAssign, ProductDeletePayload, ProductPayload, ProductRequest } from "./ProductRequest";
import { InventoryEventType, type Mode } from "@business/shared-types";
import type{ LiveProduct } from "../../../../offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository"; 


export class ProductApi {
    private readonly manager: BusinessManager;
    constructor(
        manager: BusinessManager
    ) {
        this.manager = manager;
    }
    async create(
        request: ProductRequest
    ){
        
       const productIntent: CommandIntent<ProductPayload> = {
            type: InventoryEventType.PRODUCT_CREATED,

            aggregateId: request.id,

            aggregateType: AggregateType.PRODUCT,

            mode: request.mode,

            payload: {
                id: request.id,
                name: request.name,

                price: request.price,
                costPrice: request.costPrice,

                category: request.category ?? null,
                sku: request.sku ?? null,
                barcode: request.barcode ?? null,
                reorderLevel:
                    request.reorderLevel ?? null,

                imageUrl:
                    request.imageUrl ?? null,

                description:
                    request.description ?? null,
            },
        };


       const app = await this.manager.current()
       const command = await app?.domain.commandFactory.create(productIntent);
        if(!app){
            throw new Error("Business Does not exist")
        }
        if(!command){
            throw new Error("Business Does not exist")
        }
       await app.domain.kernel.execute(command)
    }

    async update(
        request: ProductRequest
    ){
        
       const productIntent: CommandIntent<ProductPayload> = {
            type: InventoryEventType.PRODUCT_UPDATED,

            aggregateId: request.id,

            aggregateType: AggregateType.PRODUCT,

            mode: request.mode,

            payload: {
                id: request.id,
                name: request.name,

                price: request.price,
                costPrice: request.costPrice,

                category: request.category ?? null,
                sku: request.sku ?? null,
                barcode: request.barcode ?? null,
                reorderLevel:
                    request.reorderLevel ?? null,

                imageUrl:
                    request.imageUrl ?? null,

                description:
                    request.description ?? null,
            },
        };


       const app = await this.manager.current()
       const command = await app?.domain.commandFactory.create(productIntent);
        if(!app){
            throw new Error("Business Does not exist")
        }
        if(!command){
            throw new Error("Business Does not exist")
        }
       await app.domain.kernel.execute(command)
    }

    async delete(productId: string, mode: Mode){

       const productIntent: CommandIntent<ProductDeletePayload> = {
            type: InventoryEventType.PRODUCT_UPDATED,

            aggregateId: productId,

            aggregateType: AggregateType.PRODUCT,

            mode,

            payload: {
                productId,
                createdAt: Date.now()
            },
        };


       const app = await this.manager.current()
       const command = await app?.domain.commandFactory.create(productIntent);
        if(!app){
            throw new Error("Business Does not exist")
        }
        if(!command){
            throw new Error("Business Does not exist")
        }
       await app.domain.kernel.execute(command)
    }


    async getProducts(branchId: string): Promise<LiveProduct[]>{
        const app = await this.manager.current();

         if(!app){
            throw new Error("Business Does not exist")
        }
        return await app.storage.repositories.products.products(branchId)
    }

    async assignBarcode(request: ProductBarcodeAssign): Promise<void>{
        console.log("This Is the Barcode to be added to the Products: ", request)
         const productIntent: CommandIntent<ProductBarcodeAssign> = {
            type: InventoryEventType.PRODUCT_BARCODE_ASSIGN,

            aggregateId: request.productId,

            aggregateType: AggregateType.PRODUCT,

            mode: request.mode,

            payload: {
                barcode: request.barcode,
                barcodeFormat: request.barcodeFormat,
                barcodeSource: request.barcodeSource,
                mode: request.mode,
                productId: request.productId
            },
        };


       const app = await this.manager.current()
       const command = await app?.domain.commandFactory.create(productIntent);
        if(!app){
            throw new Error("Business Does not exist")
        }
        if(!command){
            throw new Error("Business Does not exist")
        }
       await app.domain.kernel.execute(command)
    }
}