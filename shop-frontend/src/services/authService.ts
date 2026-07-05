import { SQLiteAuthRepository } from "../offline/repositories/SQLiteAuthRepository/SQLiteAuthRepository";
import { useAuthStore } from "../store/useAuthStore";

export const AuthService = {
  async saveUser(userData: any) {
    
    const repo = new SQLiteAuthRepository();

    const user = await repo.upsert(userData.id, userData);

    return user;
  },

  async getCurrentUser(id: string) {

    const repo = new SQLiteAuthRepository();

    return await repo.findById(id);
  },
};