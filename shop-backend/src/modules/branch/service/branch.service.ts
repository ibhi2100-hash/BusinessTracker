import { BranchRepository } from "../repository/branch.repository.js";

export class BranchService{
    constructor(private branchRepo: BranchRepository){}

    async getBusinessBranch( businessId: string) {
        const branches = await this.branchRepo.getBusinessBranches(businessId)
        
        return branches
    }
}