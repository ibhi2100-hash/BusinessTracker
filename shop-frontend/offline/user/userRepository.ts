import { email, string } from "zod";
import { addRecord } from "../db/helpers";
import { TABLES } from "../db/schema";

export async function saveUser(user: any){
    await addRecord(TABLES.USER, user)
}