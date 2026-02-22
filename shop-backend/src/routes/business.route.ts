import { Router  } from "express";
import { BranchController } from "../modules/branch/controller/branch.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { isAdminMiddleware } from "../middlwares/isAdmin.middleware.js";
import { BranchService } from "../modules/branch/service/branch.service.js";
import { BranchRepository } from "../modules/branch/repository/branch.repository.js";
import { BusinessRepository } from "../modules/business/repository/business.repository.js";
import { BusinessService } from "../modules/business/service/business.service.js";
import { BusinessController } from "../modules/business/controller/business.controller.js";
import { requireBranch } from "../middlwares/requireBranch.middleware.js";


const router = Router();
const businessRepo = new BusinessRepository();
const businessService = new BusinessService(businessRepo);
const businessController = new BusinessController(businessService);
const branchRepo = new BranchRepository()
const branchService =new BranchService(branchRepo)
const branchController = new BranchController(branchService);

router.use(authMiddleware, isAdminMiddleware)

router.get('/branches', branchController.getBusinessBranch);

router.post('/create', branchController.createBranch);

router.get('/brandName', businessController.getBusinessData )

router.get('/context', businessController.businessContext)

router.get('/categories', requireBranch, businessController.getBranchCategory)

router.get('/brands', requireBranch, businessController.getBrands);

router.post('/switch-branch', requireBranch, businessController.switchBranch)




export default router;