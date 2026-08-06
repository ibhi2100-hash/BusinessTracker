import { BootPipelineException } from "./BootPipelineException";
import {
    BootContext,
    BootListener,
    BootProgress,
    BootStage,
    BootTask,
    BootTaskReport
} from "./BootStage";

export class BootPipeline {

    constructor(
        private readonly tasks: readonly BootTask[]
    ) {}

    async execute(
        context: BootContext,
        listener?: BootListener
    ): Promise<readonly BootTaskReport[]> {

        listener?.onStarted(
            this.tasks.length
        );

        const reports: BootTaskReport[] = [];

        const totalWeight =
            this.totalWeight();

        let completedWeight = 0;

        const pipelineStarted =
            performance.now();

        try {

            for (const task of this.tasks) {

                listener?.onTaskStarted(
                    task,
                    this.createProgress(
                        task,
                        completedWeight,
                        totalWeight,
                        pipelineStarted
                    )
                );

                const report =
                    await this.executeTask(
                        task,
                        context
                    );

                reports.push(report);

                completedWeight += task.weight;

                const completedProgress: BootProgress = {

                    stage: BootStage.RUNNING,

                    taskId: task.id,

                    taskTitle: task.title,

                    percentage:
                        totalWeight === 0
                            ? 100
                            : (completedWeight / totalWeight) * 100,

                    completed: completedWeight,

                    total: totalWeight,

                    elapsed:
                        performance.now() -
                        pipelineStarted

                };

                listener?.onTaskCompleted(
                    task,
                    completedProgress
                );
            }

            return reports;

        } catch (error) {

            listener?.onFailed(error);

            throw error;

        }

    }

    private async executeTask(
        task: BootTask,
        context: BootContext
    ): Promise<BootTaskReport> {

        const startedAt =
            performance.now();

        try {

            await task.execute(context);

            return {

                id: task.id,

                title: task.title,

                duration:
                    performance.now() -
                    startedAt,

                success: true

            };

        } catch (error) {

            throw new BootPipelineException(

                task,

                error,

                performance.now() -
                startedAt

            );

        }

    }

    private totalWeight(): number {

        return this.tasks.reduce(

            (sum, task) =>
                sum + task.weight,

            0

        );

    }

    private createProgress(
    task: BootTask,
    completedWeight: number,
    totalWeight: number,
    startedAt: number
): BootProgress {

    return {

        stage: BootStage.RUNNING,

        taskId: task.id,

        taskTitle: task.title,

        percentage:
            totalWeight === 0
                ? 100
                : (completedWeight / totalWeight) * 100,

        completed: completedWeight,

        total: totalWeight,

        elapsed:
            performance.now() - startedAt

    };

}

}