import { Command } from "./KarnelTypes/types";
export interface BusinessKernel {
    execute<TResult>(command: Command): Promise<TResult>;
   
}