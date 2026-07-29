export interface StatementDefinition<T = unknown>{

    key:string;

    sql:string;

    mapper?(
        entity:T
    ): readonly unknown[];

}