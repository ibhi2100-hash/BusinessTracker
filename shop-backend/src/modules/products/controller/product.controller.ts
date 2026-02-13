import type { Request, Response } from "express";
import {  ProductService } from "../service/product.service.js";
import { ProductRepository } from "../repository/product.repository.js";

const productRepo = new ProductRepository();
const productService = new ProductService(productRepo);

export class ProductController {
    async createProduct (req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            if(!businessId) {
                return res.status(400).json({ message: "Business ID not found in user context"});
            }
            const dto = req.body;
            const product = await productService.addProduct(dto, businessId)

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
            const products = await productService.getProductsByBusinessId(businessId);
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
            const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            if (!productId) {
                return res.status(400).json({ message: "Product ID is required"});
            }
            await productService.deleteProduct(productId, businessId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error)})
        }
    }

    async getCategory (req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            if(!businessId) {
                return res.status(400).json({ message: "Business ID not found in user context"});
            }
            const categoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            if(!categoryId) {
                return res.status(400).json({ message: "Category ID is required"});
            }
            const category = await productService.getCategoriesByBusinessId(categoryId, businessId);
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
            const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            if (!productId) {
                return res.status(400).json({ message: "Product ID is required"});
            }
            const dto = req.body;
            const product = await productService.updateProduct(productId, dto, businessId);
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error)})
        }
    }
}