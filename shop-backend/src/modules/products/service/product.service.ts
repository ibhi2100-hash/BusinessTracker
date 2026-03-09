import { ProductRepository } from "../repository/product.repository.js";
import { ProductDto, ProductUpdateDto } from "../dto/product.dto.js";
import { Product } from "../entity/product.entity.js";
import { PrismaClient } from "@prisma/client/extension";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { CashflowRepository } from "../../cashflow/repository/cashflow.repository.js";
import { inventoryRepository } from "../../inventory/repository/inventory.repository.js";
import { AlertRepository } from "../../alerts/repository/alerts.repository.js";
import { connect } from "node:http2";

export class ProductService {
    constructor(
        private  repo : ProductRepository,
        private cashflowRepo: CashflowRepository,
        private inventoryRepo: inventoryRepository,
        private alertRepo: AlertRepository,

    ){}

    async createProduct(dto: any , businessId: string, branchId: string) {
      
            return prisma.$transaction(async (tx) => {

            const product = await this.repo.createProduct(dto, businessId, branchId, tx);

            // determine stock mode
            const stockMode = dto.stockMode ?? "PURCHASE";

            if (dto.quantity && dto.quantity > 0) {

                await this.inventoryRepo.createStockMovement({
                    productId: product.id,
                    businessId,
                    branchId,
                    type: stockMode,
                    quantity: dto.quantity,
                    costPrice: dto.costPrice,
                    sellingPrice: dto.sellingPrice
                }, tx)

                 if (stockMode === "PURCHASE") {
                    await this.cashflowRepo.create({
                    business: { connect: { id: businessId}},
                    branch: { connect: { id: branchId}},
                    type: "PURCHASE_EXPENSE",
                    direction: "OUT",
                    amount: (dto.costPrice ?? 0) * dto.quantity,
                    source: "Inventory Purchase",
                    description: `Purchased stock: ${product.name}`
                    }, tx);
                }
            }

            return product;
            });
        }
            

    async getProductsByBusinessId(businessId: string) {
        return this.repo.getProductsByBusinessId(businessId);
    }

    async updateProduct(productId: string, dto: ProductDto, businessId: string, branchId: string) {
        const existingProduct = await this.repo.getProductById(productId);
        if (!existingProduct) {
            throw new Error("Product not found");
        }
        if (existingProduct.businessId !== businessId) {
            throw new Error("Unauthorized to update this product");
        }
        return this.repo.updateProduct(productId, dto, businessId, branchId);

1    }
    async updateProductPartial(productId: string, dto:ProductDto, businessId:string, branchId: string ){
           const existingProduct = await this.repo.getProductById(productId);
        if (!existingProduct) {
            throw new Error("Product not found");
        }
        if (existingProduct.businessId !== businessId) {
            throw new Error("Unauthorized to update this product");
        }
        
        const updated =  this.repo.updateProductPartial(productId, dto, businessId, branchId)

        if((await updated).quantity > 3 ){
            await this.alertRepo.resolveByType(
                branchId,
                "LOW_STOCK",
                productId
            )
        }

        return updated

    }
    async getProductById(productId: string, businessId: string){
        const product = await this.repo.getProductById(productId);
        if (!product || product.businessId !== businessId) {
            throw new Error("Product not found or does not belong to your business");
        }
        return product;
    }

    async deleteProduct(productId: string, businessId: string, branchId: string) {
        const product = await this.repo.getProductById(productId);
        if (!product || product.businessId !== businessId) {
            throw new Error("Product not found or does not belong to your business");
        }
        await this.repo.deleteProduct(productId, businessId, branchId);
    }

    async getCategoriesByBusinessId(categoryId: string, businessId: string, branchId: string): Promise<{ id: string; name: string } | null> {
        const categories = await this.repo.findCategoryById(categoryId, businessId, );
        if (!categories) {
            return null;
        }
        return { id: categories.id, name: categories.name };
    }

    async createManyOpeningProducts(products: any, businessId: string, branchId: string) {
        return Promise.all(
            products.map((p: any) =>
            this.createProduct(
                { ...p, stockMode: "OPENING" },
                businessId,
                branchId

            )
            )
        );
}

getProductForBrand = async (businessId: string, branchId: string, brandId: string) => {
    if(!brandId) throw new Error("Brand ID does not exist");
    const products = await this.repo.getBrandProducts(businessId, branchId, brandId)

    return products
}

    

}

