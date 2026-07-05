// PreparedStatement.ts

export interface PreparedStatementContract {

    execute(
        params?: readonly unknown[]
    ): Promise<void>;

    query<T>(
        params?: readonly unknown[]
    ): Promise<T[]>;

    scalar<T>(
        params?: readonly unknown[]
    ): Promise<T | null>;

    exists(
        params?: readonly unknown[]
    ): Promise<boolean>;

    dispose(): void;

}