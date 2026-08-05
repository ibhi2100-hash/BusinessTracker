import { Command } from "./KarnelTypes/types";
export interface Kernel {
    execute(command: Command): Promise<void>;
   
}