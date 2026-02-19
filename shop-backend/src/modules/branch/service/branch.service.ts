import { CreateManyBranchDto } from "../dto/CrateBranch.dto.js";
import { BranchRepository } from "../repository/branch.repository.js";

export class BranchService{
    constructor(private branchRepo: BranchRepository){}

    async getBusinessBranch( businessId: string) {
        const branches = await this.branchRepo.getBusinessBranches(businessId)
        
        return branches
    }

    creatBranch = async ( 
        businessId: string , 
        dto: {
            name: string,
            address?: string
            phone?: string
    } )=> {
        
        try{
        const existingBranch = await this.branchRepo.findBusinessBranch(businessId, dto.name);


        if(existingBranch.length > 0 ) {
            throw new Error(" One or more branch already exists")
        }

        const createdBranch = await this.branchRepo.createBranch(businessId, dto )

        return{ message: "Branches created successfully", createdBranch}
    }catch(error: any){
        if(error.code === "P2002"){
            throw new Error (" one or more branch name already exist")
        }
        throw error;
    }
    }
}