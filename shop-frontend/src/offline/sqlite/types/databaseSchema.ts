export interface TableSchema {
    name: string;

    createSQL: string;

    indexes?: string[];
}