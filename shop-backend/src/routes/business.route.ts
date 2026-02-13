import { Router  } from "express";
import { BranchController } from "../modules/branch/controller/branch.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { isAdminMiddleware } from "../middlwares/isAdmin.middleware.js";
import { requireBusiness } from "../middlwares/helpers.middlewares.js";
import { BranchService } from "../modules/branch/service/branch.service.js";
import { BranchRepository } from "../modules/branch/repository/branch.repository.js";


const router = Router();
const branchRepo = new BranchRepository()
const branchService =new BranchService(branchRepo)
const branchController = new BranchController(branchService);

router.use(authMiddleware, isAdminMiddleware, requireBusiness)

router.get('/branches', branchController.getBusinessBranch)


export default router;