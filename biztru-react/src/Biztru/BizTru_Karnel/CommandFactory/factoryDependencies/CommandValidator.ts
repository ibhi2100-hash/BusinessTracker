import { BusinessEventTypes } from "@business/shared-types";
import type{ CommandValidator } from "../../contracts/SubKernelContracts";
import type { Command } from "../../KarnelTypes/types";

export class CommandValidation
implements CommandValidator {
    constructor(){}
    
    async validate(command: Command): Promise<void> {
         if(command.type === BusinessEventTypes.BUSINESS_CREATED){
            console.log("I have Finished ")
        }
    }
}