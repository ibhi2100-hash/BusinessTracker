import { getDb } from "../db/indexDB";
import { addRecord, getRecord } from "../db/helpers";
import { getByIndex } from "../db/helpers";
import { TABLES } from "../db/schema";
import { useBusinessStore } from "@/store/businessStore";
import { createEntity } from "../entities/entityFactory";


export const  inventoryHelper = {
        

    async getCategories(){
        const db = await getDb();
        const business = useBusinessStore.getState().business;

        if(!business) return [];
       

        const categories = await getByIndex(TABLES.CATEGORIES, "by_businessId", business.id);

        return categories

    },
    async getBrandsByCategory(categoryId: string){
        const brands = await getByIndex(TABLES.BRANDS, "by_categoryId", categoryId)

        return brands
    },

    async getProductsByBrand(brandId: string){
        const products = await getByIndex(TABLES.PRODUCTS, "by_brandId", brandId)
        console.log("This is the bastard product from the indexDb", products)
        return products
    },
    async addCategory(categoryData: any){
        const category =  createEntity(categoryData)
        await addRecord(TABLES.CATEGORIES, category)

        return category
    },

    async addBrands(brandData: any){
        const brand = createEntity(brandData)
        await addRecord(TABLES.BRANDS, brand)
        return brand
    },
    async addProducts(product: any){
        await addRecord(TABLES.PRODUCTS, product)
        return product
    }
}