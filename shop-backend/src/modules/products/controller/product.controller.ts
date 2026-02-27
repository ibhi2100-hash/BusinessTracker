import type { Request, Response } from "express";
import {  ProductService } from "../service/product.service.js";
import { ProductRepository } from "../repository/product.repository.js";



export class ProductController {    
    constructor(private productService: ProductService){}


    async createProduct (req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            
            if(!businessId) {
                return res.status(400).json({ message: "Business ID not found in user context"});
            }
            const branchId = req.user?.branchId
            console.log("BRANCH ID: ", branchId)
            if(!branchId) {
                return res.status(400).json({ message: "Branch ID not found"})
            }
            const dto = req.body;
            const product = await this.productService.createProduct(dto, businessId, branchId)

            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error)})
        }
    }
    async getProducts (req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            if(!businessId) {
                return res.status(400).json({ message: "Business ID not found in user context"});
            }
            const products = await this.productService.getProductsByBusinessId(businessId);
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error)})
        }
    }
    async deleteProduct (req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            if(!businessId) {
                return res.status(400).json({ message: "Business ID not found in user context"});
            }
            const branchId = req.user?.branchId
            if(!branchId) {
                return res.status(400).json({ message: "Branch ID not found"})
            }

            const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            if (!productId) {
                return res.status(400).json({ message: "Product ID is required"});
            }
            await this.productService.deleteProduct(productId, businessId, branchId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error)})
        }
    }

    async getCategory (req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            const branchId = req.user?.branchId;
            if(!businessId ) {
                return res.status(400).json({ message: "Business ID not found in user context"});
            }
            if(!branchId) {
                return res.status(400).json({ message: "Branch ID not found in user context"});
            }
            const categoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            if(!categoryId) {
                return res.status(400).json({ message: "Category ID is required"});
            }
            const category = await this.productService.getCategoriesByBusinessId(categoryId, businessId, branchId);
            res.status(200).json(category);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error)})
        }
    }

    async updateProduct (req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            if(!businessId) {
                return res.status(400).json({ message: "Business ID not found in user context"});
            }
            const branchId = req.user!.branchId;

            if(!branchId) {
                res.status(400).json({ message: "Branch ID not found in user context"})
            }
            const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            if (!productId) {
                return res.status(400).json({ message: "Product ID is required"});
            }
            const dto = req.body;
            const product = await this.productService.updateProductPartial(productId, dto, businessId, branchId);
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error)})
        }
    }
async getProductsForBrand(req: Request, res: Response) {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      return res.status(400).json({ message: "Business ID not found in user context" });
    }

    const branchId = req.user?.branchId;
    if (!branchId) {
      return res.status(400).json({ message: "Branch ID not found in user context" });
    }

    const brandId = req.query.brandId;
    if (!brandId || typeof brandId !== "string") {
      return res.status(400).json({ message: "brandId query parameter is required" });
    }

    // Fetch products via service
    const products = await this.productService.getProductForBrand(businessId, branchId, brandId);
 

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
}