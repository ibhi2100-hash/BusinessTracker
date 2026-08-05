import { PipelineContext, PipelineContextFactory } from "../../contracts/SubKernelContracts";
import { Command } from "../../KarnelTypes/types";
import { CommandMetadata } from "../../BusinessClock/MetadataBuilderContract";

export class DefaultPipelineContext 
implements PipelineContextFactory {
    create(command: Command): PipelineContext {
        
        return{
            request: {
                command,
            },

            runtime: {
                events: []
            },

            persistence: {
                projections: [],

                snapshots: [],

                outbox: [],

                syncQueue: []
            },

            diagnostics: {
                startedAt: Date.now()
            }
        }
    }
}