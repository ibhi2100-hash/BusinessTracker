import { BusinessKernel } from "@/src/BizTru_Karnel/BusinessKernelContract";
import { Command } from "@/src/BizTru_Karnel/KarnelTypes/types";

export abstract class ApplicationService {
    constructor(
        protected readonly kernel: BusinessKernel
    ) {}

    protected async execute<TResult>(
        commad: Command
    ): Promise<TResult>{

        return this.kernel.execute<TResult>(
            commad
        )
    }
}