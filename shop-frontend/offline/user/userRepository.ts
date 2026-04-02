import { z } from "zod";
import { addRecord } from "../db/helpers";
import { TABLES } from "../db/schema";
import { useAuthStore } from "@/store/useAuthStore";
import { getAll } from "../db/helpers";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export type PersistedUser = z.infer<typeof UserSchema>;

export async function saveUser(user: unknown) {
  const parsed = UserSchema.parse(user); // ✅ runtime validation
  await addRecord(TABLES.USER, parsed);
}




export async function loadUser() {
    
    const users = await getAll(TABLES.USER);

    const user = users[0] || null;
    useAuthStore.getState().setUser(user);

    return user
}
