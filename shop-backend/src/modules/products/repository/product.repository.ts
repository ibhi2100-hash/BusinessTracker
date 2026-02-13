import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { ProductDto, ProductUpdateDto } from "../dto/product.dto.js";
import { Product, ProductFilter } from "../entity/product.entity.js";


export class ProductRepository {

    async getOrCreateCategory(name: string, businessId: string) {
        let category = await prisma.category.findFirst({
            where: { name, businessId }
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name, businessId }
            });
        }

        return category;
    }

    async getOrCreateBrand(name: string) {
        let brand = await prisma.brand.findFirst({
            where: { name }
        });

        if (!brand) {
            brand = await prisma.brand.create({
                data: { name }
            });
        }

        return brand;
    }

    async createProduct(dto: ProductDto, businessId: string): Promise<Product | null> {
        // Handle category
        const category = dto.categoryName
            ? await this.getOrCreateCategory(dto.categoryName, businessId)
            : await this.findCategoryById(dto.categoryId!, businessId);

        if (!category) throw new Error("Category not found for your business");

        // Handle brand (optional)
        let brandId: string | null = null;
        if (dto.brandName) {
            const brand = await this.getOrCreateBrand(dto.brandName);
            brandId = brand.id;
        } else if (dto.brandId) {
            const brand = await this.findBrandById(dto.brandId, businessId);
            if (!brand) throw new Error("Brand not found");
            brandId = brand.id;
        }

        // Create product
        const product = await prisma.product.create({
            data: {
                name: dto.name,
                type: dto.type,
                model: dto.model || null,
                costPrice: dto.costPrice ?? null,
                sellingPrice: dto.sellingPrice ?? null,
                quantity: dto.quantity ?? 0,
                imei: dto.imei || null,
                condition: dto.condition || null,
                businessId,
                categoryId: category.id,
                brandId
            },
            select: {
                id: true,
                name: true,
                type: true,
                model: true,
                costPrice: true,
                sellingPrice: true,
                quantity: true,
                imei: true,
                createdAt: true,
                updatedAt: true,
                businessId: true,
                brandId: true,
                categoryId: true
            }
        });

        return product as Product;
    }

    async findCategoryById(categoryId: string, businessId: string) {
        return prisma.category.findFirst({
            where: { id: categoryId, businessId }
        });
    }

    async findBrandById(brandId: string, businessId: string) {
        return prisma.brand.findFirst({
            where: { id: brandId }
        });
    }
    async getProductById(productId: string): Promise<Product | null> {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                name: true,
                type: true,
                model: true,
                costPrice: true,
                sellingPrice: true,
                quantity: true,
                imei: true,
                createdAt: true,
                updatedAt: true,
                businessId: true,
                brandId: true,
                categoryId: true
            }
        });
        return product as Product | null;
    }

    async getProductsByBusinessId(businessId: string): Promise<Product[]> {
        const products = await prisma.product.findMany({
            where: { businessId },
            select: {
                id: true,
                name: true,
                type: true,
                model: true,
                costPrice: true,
                sellingPrice: true,
                quantity: true,
                imei: true,
                createdAt: true,
                updatedAt: true,
                businessId: true,
                brandId: true,
                categoryId: true
            }
        });
        return products as Product[];
    }

    async updateProduct(productId: string, dto: ProductDto, businessId: string): Promise<Product | null> {
        const product = await prisma.product.updateMany({
            where: { id: productId, businessId },
            data: { ...dto }
        });
        return product as any;
    }

    async deleteProduct(productId: string, businessId: string): Promise<void> {
        await prisma.product.deleteMany({
            where: { id: productId, businessId }
        });
    } 
    async updateProductPartial(productId: string, dto: ProductUpdateDto, businessId: string): Promise<Product|null>{
        // Handle category
        let categoryId: string | undefined;
        if(dto.categoryName) {
            const category = await this.getOrCreateCategory(dto.categoryName, businessId);
            categoryId = category.id;
        }else if (dto.categoryId){
            const category = await prisma.category.findFirst({
                where: {id: dto.categoryId, businessId}
            });
            if(!category) throw new Error("Category not found for your business")
            categoryId = category.id;
        }

        //Handle brand
        let brandId: string | null = null;
        if(dto.brandName) {
            const brand = await this.getOrCreateBrand(dto.brandName);
            brandId = brand.id;
        } else if (dto.brandId){
            const brand = await prisma.brand.findFirst({
                where: { id: dto.brandId}
            });
            if(!brand) throw new Error("Brand not found");
            brandId = brand.id
        }

        // Build data object dynamically

        const data: any = {};
        if(dto.name !== undefined) data.name = dto.name;
        if(dto.type !== undefined) data.type = dto.type;
        if(dto.model !== undefined) data.model = dto.model;
        if(dto.costPrice !== undefined) data.costPrice = dto.costPrice;
        if(dto.sellingPrice !== undefined) data.sellingPrice = dto.sellingPrice;
        if(dto.quantity !== undefined) data.quantity = dto.quantity;
        if(dto.imei !== undefined) data.imei = dto.imei;
        if(dto.condition !== undefined) data.condition = dto.condition;
        if(categoryId !== undefined) data.categoryId = categoryId;
        if(brandId !== undefined) data.brandId = brandId;

        const updated = await prisma.product.updateMany({
            where: { id: productId, businessId},
            data
        })
        if(updated.count === 0 ) throw new Error(" No product updated");

        return prisma.product.findFirst({ where: { id: productId}})as Promise<Product>

    }  
/*
    async listProducts(businessId:string, filter?:ProductFilter):Promise<Product>{
        const where:any = { businessId};

        if(filter?.categoryId){
            where.categoryId = filter.categoryId;
        }

        if(filter?.type){
            where.type = filter.type;
        }
        if(filter?.inStock !== undefined){
            where.quantity = filter.inStock
        }

    
    }*/

    async findForSale(productId: string, businessId: string, tx: Prisma.TransactionClient){
        return tx.product.findFirst({
            where:{id: productId, businessId, isActive: true}
        })
    }
}
