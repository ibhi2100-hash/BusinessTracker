export class SQLiteStatement {
    private readonly stmt: any
    constructor(
        stmt: any
    ) {
        this.stmt = stmt
    }

    async run(...params: unknown[]) {

        this.stmt.reset();

        this.stmt.bind(params);

        this.stmt.step();

    }

    query<T>() : T[] {

        this.stmt.reset();

        const rows:T[] = [];

        while(this.stmt.step()){

            rows.push(
                this.stmt.get({})
            );

        }

        return rows;

    }

    close() {

        this.stmt.finalize();

    }
}