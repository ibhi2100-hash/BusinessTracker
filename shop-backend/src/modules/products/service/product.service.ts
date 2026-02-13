import { ProductRepository } from "../repository/product.repository.js";
import { ProductDto, ProductUpdateDto } from "../dto/product.dto.js";
import { Product } from "../entity/product.entity.js";

export class ProductService {
    constructor(private  productRepo: ProductRepository){}

    async addProduct(dto: ProductDto, businessId: string): Promise<Product | null> {
        return this.productRepo.createProduct(dto, businessId)
    }

    async getProductsByBusinessId(businessId: string): Promise<Product[]> {
        return this.productRepo.getProductsByBusinessId(businessId);
    }

    async updateProduct(productId: string, dto: ProductDto, businessId: string): Promise<Product | null> {
        const existingProduct = await this.productRepo.getProductById(productId);
        if (!existingProduct) {
            throw new Error("Product not found");
        }
        if (existingProduct.businessId !== businessId) {
            throw new Error("Unauthorized to update this product");
        }
        return this.productRepo.updateProduct(productId, dto, businessId);

1    }
    async updateProductPartial(productId: string, dto: ProductUpdateDto, businessId:string){
        return this.productRepo.updateProductPartial(productId, dto, businessId)
    }
    async getProductById(productId: string, businessId: string): Promise<Product | null> {
        const product = await this.productRepo.getProductById(productId);
        if (!product || product.businessId !== businessId) {
            throw new Error("Product not found or does not belong to your business");
        }
        return product;
    }

    async deleteProduct(productId: string, businessId: string): Promise<void> {
        const product = await this.productRepo.getProductById(productId);
        if (!product || product.businessId !== businessId) {
            throw new Error("Product not found or does not belong to your business");
        }
        await this.productRepo.deleteProduct(productId, businessId);
    }

    async getCategoriesByBusinessId(categoryId: string, businessId: string): Promise<{ id: string; name: string } | null> {
        const categories = await this.productRepo.findCategoryById(categoryId, businessId);
        if (!categories) {
            return null;
        }
        return { id: categories.id, name: categories.name };
    }
    

}

