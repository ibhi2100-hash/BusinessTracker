import { z } from "zod";
import { useAuthStore } from "@/store/useAuthStore";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export type PersistedUser = z.infer<typeof UserSchema>;

export async function saveUser(user: unknown) {
  const parsed = UserSchema.parse(user); // ✅ runtime validation
}




export async function loadUser() {
    
    const users = []

    const user = users[0] || null;
    useAuthStore.getState().setUser(user);

    return user
}
