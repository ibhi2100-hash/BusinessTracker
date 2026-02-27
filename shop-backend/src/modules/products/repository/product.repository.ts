import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { ProductDto } from "../dto/product.dto.js";

export class ProductRepository {

async getOrCreateCategory(
  name: string,
  businessId: string,
  branchId: string,
  db: Prisma.TransactionClient
) {
  return db.category.upsert({
    where: {
      name_businessId_branchId: { // must match @@unique
        name,
        businessId,
        branchId
      }
    },
    update: {}, // do nothing if exists
    create: { name, businessId, branchId }
  });
}

async getOrCreateBrand(
  name: string,
  businessId: string,
  branchId: string,
  categoryId: string,
  db: Prisma.TransactionClient
) {
  return db.brand.upsert({
    where: {
      name_categoryId_branchId: { // must match @@unique
        name,
        categoryId,
        branchId
      }
    },
    update: {}, // do nothing if exists
    create: {
      name,
      businessId,
      branchId,
      categoryId
    }
  });
}

  async createProduct(
  data: any,
  businessId: string,
  branchId: string,
  tx?: Prisma.TransactionClient
) {
  const db = tx ?? prisma;

  // --- Category ---
  const category = data.categoryName
    ? await this.getOrCreateCategory(data.categoryName, businessId, branchId, db)
    : await this.findCategoryById(data.categoryId!, businessId);

  if (!category) throw new Error("Category not found");
  const categoryId = category.id;

  // --- Brand ---
  let brandId: string;
  if (data.brandName) {
    const brand = await this.getOrCreateBrand(
      data.brandName,
      businessId,
      branchId,
      categoryId,
      db
    );
    brandId = brand.id;
  } else if (data.brandId) {
    const brand = await db.brand.findFirst({
      where: { id: data.brandId, businessId, categoryId, branchId }
    });
    if (!brand) throw new Error("Brand not found for this branch and category");
    brandId = brand.id;
  } else {
    throw new Error("Brand is required");
  }

  // --- Create Product ---
  const product = await db.product.create({
    data: {
      name: data.name,
      type: data.type,
      model: data.model || null,
      costPrice: data.costPrice ?? null,
      sellingPrice: data.sellingPrice ?? null,
      quantity: data.quantity ?? 0,
      imei: data.imei || null,
      condition: data.condition || null,
      businessId,
      branchId,
      categoryId,
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
      branchId: true,
      brandId: true,
      brand: true,
      categoryId: true
    }
  });

  console.log("Products", product);
  return product;
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

  // 1️⃣ Fetch existing product first
  const existingProduct = await prisma.product.findFirst({
    where: { id: productId, businessId },
    include: { category: true }
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  // 2️⃣ Resolve category
  let categoryId = existingProduct.categoryId;

if (dto.categoryName) {
  const category =
    await prisma.category.findFirst({
      where: { 
        name: dto.categoryName, 
        businessId,
        branchId: existingProduct.branchId
      }
    }) ??
    await prisma.category.create({
      data: { 
        name: dto.categoryName,
        businessId,
        branchId: existingProduct.branchId
      }
    });

  categoryId = category.id;
}
  else if (dto.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: dto.categoryId, businessId }
    });

    if (!category) throw new Error("Category not found");
    categoryId = category.id;
  }

  // 3️⃣ Resolve brand safely
  let brandId = existingProduct.brandId;

  if (dto.brandName) {

    const brand =
      await prisma.brand.findFirst({
        where: { 
          name: dto.brandName,
          businessId,
          categoryId,
          branchId
        }
      }) ??
      await prisma.brand.create({
        data: { 
          name: dto.brandName,
          businessId,
          categoryId,
          branchId,
        }
      });

    brandId = brand.id;
  }
  else if (dto.brandId) {

    const brand = await prisma.brand.findFirst({
      where: { 
        id: dto.brandId,
        businessId,
        categoryId
      }
    });

    if (!brand) {
      throw new Error("Brand not found in this category");
    }

    brandId = brand.id;
  }

  // 4️⃣ Build update object
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

  // Always reconnect resolved relations
  data.category = { connect: { id: categoryId } };
  if (brandId) {
    data.brand = { connect: { id: brandId } };
  }

  if (branchId) {
    data.branch = { connect: { id: branchId } };
  }

  // 5️⃣ Safe update with ownership enforcement
  return prisma.product.update({
    where: { 
      id: productId,
      businessId
    },
    data,
  });
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



