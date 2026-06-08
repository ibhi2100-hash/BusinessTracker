import { BaseRepo } from "../baseRepo/baseRepo";

export class AuthRepo extends BaseRepo {
  async saveUser(userData: any) {
    return this.tx(
      async () => {
        // enforce single user
        await this.db.users.clear();
        await this.db.users.add(userData);

        return userData;
      },
      this.db.users
    );
  }
  async saveAuth(authData: any) {   
        // enforce single auth record
        await this.db.auth.clear();
        await this.db.auth.put({
          id: "current",
          ...authData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
  }

  async getUser() {
    const users = await this.db.users.toArray();
    return users[0] ?? null;
  }
}