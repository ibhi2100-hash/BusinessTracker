import { response, type Request, type Response } from "express";
import { BusinessService } from "../service/business.service.js";

export class BusinessController {
  constructor(private businessService: BusinessService) {}

  getBusinessData = async (req: Request, res: Response) => {
    try {
      const user = req.user;

      if (!user?.businessId) {
        return res.status(400).json({
          message: "Business context missing",
        });
      }

      const result = await this.businessService.getBusinessData(
        user.businessId
      );

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to load business data" });
    }
  };

  businessContext = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user?.businessId) {
      return res.status(400).json({
        message: "User is not assigned to a business",
      });
    }

    const context = await this.businessService.getBusinessContext(user);
    console.log(context)
    return res.json(context);
  };

  switchBranch = async (req: Request, res: Response) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!user.businessId) {
        return res.status(400).json({
          message: "Business context missing",
        });
      }

      const { branchId } = req.body;

      if (!branchId) {
        return res.status(400).json({
          message: "branchId is required",
        });
      }
      if(!user.role) throw new Error("missing role")

      const result = await this.businessService.getSwitchedBranch(
        user.id,
        branchId,
        user.businessId,
        user.role
      );

      const { branch, token } = result;

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });

      res.json({
        success: true,
        branch,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to switch branch",
      });
    }
  };

  getBranchCategory = async (req: Request, res: Response)=> {
    try {
        const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const businessId = user.businessId
      if (!businessId) {
        return res.status(400).json({
          message: "Business context missing",
        });
      }

      const { branchId } = user;

      if (!branchId) {
        return res.status(400).json({
          message: "branchId is required",
        });
      }
      const result = await this.businessService.getBranchCategory(businessId, branchId)
      res.status(201).json(result ?? [])
    } catch (error) {
        console.error(error);
      res.status(500).json({
        message: "Failed to fetch branches",
      });
    }
  }
  getBrands = async (req: Request, res: Response)=> {
    try {
      const businessId = req.user?.businessId;
      const branchId = req.user?.branchId;
      if(!businessId) return res.status(400).json({ meassage: "Business ID does not Exists"})
      
      const categoryId = req.query.categoryId as string;
      if(!categoryId) return res.status(400).json({ message: " Category ID does not Exists"});

      const brands = await this.businessService.getBrandsByCategory(categoryId, businessId, branchId);
      res.status(200).json(brands ?? [])
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error instanceof Error ? error.message : String(error)});
    }
  }
}
