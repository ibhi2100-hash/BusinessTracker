import { Command } from "./KarnelTypes/types";
export interface BusinessKernel {
    execute(command: Command): Promise<void>;
   
}