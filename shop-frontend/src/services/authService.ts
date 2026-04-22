import { AuthRepo } from "../repositories/auth/authRepo";
import { useAuthStore } from "../store/useAuthStore";

export const AuthService = {
  async saveUser(userData: any) {
    const userId = userData.id;
    if (!userId) throw new Error("User ID missing");

    const repo = new AuthRepo(userId);

    const user = await repo.saveUser(userData);

    useAuthStore.getState().setUser(user);

    return user;
  },

  async getCurrentUser() {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return null;

    const repo = new AuthRepo(userId);

    return await repo.getUser();
  },
};