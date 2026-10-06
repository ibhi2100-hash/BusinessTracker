import type {
    User
} from "@business/shared-types";

import {
    UserStatements
} from "../../statements/users/UserStatements";


export class SQLiteAuthRepository {

    private readonly users: UserStatements;


    constructor(
        users: UserStatements
    ) {
        this.users = users;
    }


    async addUser(
        user: User
    ): Promise<User> {

        await this.users.insert.execute(
            UserMapper.toInsert(user)
        );


        const rows =
            await this.users.findById.query<User>([
                user.id
            ]);


        if (rows.length === 0) {

            throw new Error(
                "User was inserted but could not be loaded"
            );

        }


        return rows[0];
    }


    async findById(
        userId: string
    ): Promise<User> {

        const rows =
            await this.users.findById.query<User>([
                userId
            ]);


        if (rows.length === 0) {

            throw new Error(
                `User not found: ${userId}`
            );

        }


        return rows[0];
    }


    async update(
        user: User
    ): Promise<User> {

        await this.users.updateUser.execute(
            UserMapper.toUpdate(user)
        );


        return this.findById(user.id);
    }


  async updateBusiness(
    userId: string,
    businessId: string,
    version: number,
    lastEventId: string,
    updatedAt: number
): Promise<void> {
    await this.users.updateBusiness.execute([
        businessId,
        version,
        lastEventId,
        updatedAt,
        userId,
    ]);
}

    async updateBranch(
        userId: string,
        branchId: string,
        version: number,
        lastEventId: string,
        updatedAt: number
    ): Promise<User> {

        await this.users.updateBranch.execute([
            branchId,
            version,
            lastEventId,
            updatedAt,
            userId,
        ]);


        return this.findById(userId);
    }


    async updateActivation(
        userId: string,
        isActive: number,
        version: number,
        lastEventId: string,
        updatedAt: number
    ): Promise<User> {

        await this.users.updateActivation.execute([
            isActive,
            version,
            lastEventId,
            updatedAt,
            userId,
        ]);


        return this.findById(userId);
    }


    async updateOnboarding(
        userId: string,
        onboardingCompleted: number,
        version: number,
        lastEventId: string,
        updatedAt: number
    ): Promise<User> {

        await this.users.updateOnboarding.execute([
            onboardingCompleted,
            version,
            lastEventId,
            updatedAt,
            userId,
        ]);


        return this.findById(userId);
    }


    async updateProfile(
        userId: string,
        name: string,
        email: string,
        role: User["role"],
        version: number,
        lastEventId: string,
        updatedAt: number
    ): Promise<User> {

        await this.users.updateProfile.execute([
            name,
            email,
            role,
            version,
            lastEventId,
            updatedAt,
            userId,
        ]);


        return this.findById(userId);
    }
}


export class UserMapper {

    static toInsert(
        user: User
    ): readonly unknown[] {

        return [
            user.id,
            user.businessId,
            user.branchId,
            user.name,
            user.email,
            user.role,
            user.onboardingCompleted,
            user.isActive,
            user.version,
            user.lastEventId,
            user.createdAt,
            user.updatedAt,
        ];
    }


    static toUpdate(
        user: User
    ): readonly unknown[] {

        return [
            user.businessId,
            user.branchId,
            user.name,
            user.email,
            user.role,
            user.onboardingCompleted,
            user.isActive,
            user.version,
            user.lastEventId,
            user.updatedAt,
            user.id,
        ];
    }

}