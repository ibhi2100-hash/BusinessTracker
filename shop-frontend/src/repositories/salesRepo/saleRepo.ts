import { db } from "../index";

export const salesRepo = {
    add: (sale: any) => db.table("sales").add(sale)
}