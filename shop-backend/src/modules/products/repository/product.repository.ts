import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { ProductDto } from "../dto/product.dto.js";

export class ProductRepository {

async getOrCreateCategory(
  businessId: string,
  branchId: string,
  payload: { id: string; categoryName: string },
  db: Prisma.TransactionClient
) {
  const name = payload.categoryName.trim().toLowerCase();

  return db.category.upsert({
    where: {
      name_businessId_branchId: {
        name,
        businessId,
        branchId
      }
    },
    update: {},
    create: {
      id: payload.id, // 🔥 preserve client ID
      name,
      businessId,
      branchId
    }
  });
}
async getOrCreateBrand(
  name: string,
  businessId: string,
  branchId: string,
  categoryId: string,
  payload: { id: string },
  db: Prisma.TransactionClient
) {
  const normalized = name.trim().toLowerCase();

  return db.brand.upsert({
    where: {
      name_categoryId_branchId: {
        name: normalized,
        categoryId,
        branchId
      }
    },
    update: {},
    create: {
      id: payload.id,
      name: normalized,
      businessId,
      branchId,
      categoryId
    }
  });
}


    async findCategoryById(categoryId: string, businessId: string) {
        return prisma.category.findFirst({
            where: { id: categoryId, businessId }
        });
    }

    async findBrandById(brandId: string, businessId: string) {
        return prisma.brand.findFirst({
            where: { id: brandId, businessId }
        });
    }
    async getProductById(productId: string) {
        const product = await prisma.product.findUnique({
            where: { id: productId , isActive: true },
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
        return product;
    }

    async getProductsByBusinessId(businessId: string) {
        const products = await prisma.product.findMany({
            where: { businessId, isActive: true },
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
        return products;
    }

    async updateProduct(productId: string, dto: any,  businessId: string, branchId: string) {
        const product = await prisma.product.update({
            where: { id: productId, businessId, branchId },
            data: { ...dto }
        });
        return product as any;
    }

    async deleteProduct(productId: string, businessId: string, branchId: string): Promise<void> {
        await prisma.product.update({
            where: { id: productId, businessId, branchId },
            data: { isActive: false}
        });
    } 
async updateProductPartial(
  productId: string,
  dto: ProductDto,
  businessId: string,
  branchId: string
) {
  const db = prisma;

  // -----------------------------
  // 1️⃣ FETCH EXISTING PRODUCT
  // -----------------------------
  const existingProduct = await db.product.findFirst({
    where: { id: productId, businessId, branchId },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  // -----------------------------
  // 2️⃣ RESOLVE CATEGORY (ID-FIRST)
  // -----------------------------
  let categoryId = existingProduct.categoryId;

  if (dto.categoryId) {
    // try find by ID first
    let category = await db.category.findFirst({
      where: {
        id: dto.categoryId,
        businessId,
        branchId,
      },
    });

    // fallback → upsert using name if provided
    if (!category && dto.categoryName) {
      category = await db.category.upsert({
        where: {
          name_businessId_branchId: {
            name: dto.categoryName.trim().toLowerCase(),
            businessId,
            branchId,
          },
        },
        update: {},
        create: {
          id: dto.categoryId, // 🔥 preserve client ID
          name: dto.categoryName.trim().toLowerCase(),
          businessId,
          branchId,
        },
      });
    }

    if (!category) {
      throw new Error("Category not found");
    }

    categoryId = category.id;
  }

  // -----------------------------
  // 3️⃣ RESOLVE BRAND (ID-FIRST)
  // -----------------------------
  let brandId = existingProduct.brandId;

  if (dto.brandId) {
    let brand = await db.brand.findFirst({
      where: {
        id: dto.brandId,
        businessId,
        branchId,
      },
    });

    // fallback → upsert
    if (!brand && dto.brandName) {
      brand = await db.brand.upsert({
        where: {
          name_categoryId_branchId: {
            name: dto.brandName.trim().toLowerCase(),
            categoryId,
            branchId,
          },
        },
        update: {},
        create: {
          id: dto.brandId, // 🔥 preserve ID
          name: dto.brandName.trim().toLowerCase(),
          businessId,
          branchId,
          categoryId,
        },
      });
    }

    if (!brand) {
      throw new Error("Brand not found");
    }

    brandId = brand.id;
  }

  // -----------------------------
  // 4️⃣ BUILD UPDATE PAYLOAD
  // -----------------------------
  const data: any = {};

  if (dto.name !== undefined) data.name = dto.name;
  if (dto.type !== undefined) data.type = dto.type;
  if (dto.model !== undefined) data.model = dto.model;

  if (dto.costPrice !== undefined) data.costPrice = Number(dto.costPrice);
  if (dto.sellingPrice !== undefined) data.sellingPrice = Number(dto.sellingPrice);
  if (dto.quantity !== undefined) data.quantity = Number(dto.quantity);

  if (dto.imei !== undefined) data.imei = dto.imei;
  if (dto.condition !== undefined) data.condition = dto.condition;
  if (dto.isActive !== undefined) data.isActive = dto.isActive;

  // always reconnect relations
  data.category = { connect: { id: categoryId } };
  data.brand = { connect: { id: brandId } };

  // -----------------------------
  // 5️⃣ UPDATE PRODUCT
  // -----------------------------
  const updatedProduct = await db.product.update({
    where: {
      id: productId,
      businessId,
    },
    data,
  });

  return updatedProduct;
}
/*
    async listProducts(businessId:string, filter?:ProductFilter):Promise<Product>{
        const where:any = { businessId};

        if(filter?.categoryId){
            where.categoryId = filter.categoryId;
        }

        if(filter?.type){
            where.tyxpe = filter.type;
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
getBrandProducts = async (
  businessId: string,
  branchId: string,
  brandId: string
) => {

  // Ensure brand belongs to this business
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, businessId }
  });

  if (!brand) {
    throw new Error("Brand not found for this business");
  }

 const branchProduct =  prisma.product.findMany({
    where: {
      brandId,
      businessId,
      branchId,
      isActive: true
    },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return branchProduct
};
}



