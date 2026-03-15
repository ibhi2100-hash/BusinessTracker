import { useAuthStore } from "@/store/useAuthStore";
import { TABLES } from "../db/schema";
import { getAll } from "../db/helpers";

export async function loadUser() {
    
    const users = await getAll(TABLES.USER);

    const user = users[0] || null;
    useAuthStore.getState().setUser(user);

    return user
}