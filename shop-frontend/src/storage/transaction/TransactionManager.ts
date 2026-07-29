import { QueryRunner } from "../queryRunner/QueryRunner";


export class TransactionManager {
    private active: boolean = true ;
    constructor(
        private readonly queryRunner: QueryRunner
    ) {}

    private async begin() {

        await this.queryRunner.execute(`
            BEGIN IMMEDIATE;
        `);

    }
    private async rollback(){
        await this.queryRunner.execute(`
            ROLLBACK;`
        );
    }

    private async commit() {

        await this.queryRunner.execute(`
            COMMIT;
        `);

    }

   async run<T>(
    action: () => Promise<T>
): Promise<T> {

    await this.begin();

    try {

        const result = await action();

        await this.commit();

        return result;

    } catch (error) {

        await this.rollback();

        throw error;

    } finally{
        this.active = false
    }

} 
}