import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { CreateBusinessDto } from "../dto/businessReg.dto.js";
import { signToken } from "../../../helpers/jwtHelper/jwthelper.js";

export class OnboardingService {
  

  async createBusiness(userId: string, dto: CreateBusinessDto) {
    return prisma.$transaction(async (tx) => {

      // 1️⃣ Fetch user
      const user = await tx.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.businessId) {
        throw new Error("User already has a business");
      }

      // 2️⃣ Create Business
      const business = await tx.business.create({
        data: {
          name: dto.name,
          address: dto?.address ?? null,
          onboardingStep: 2
        }
      });

      // 3️⃣ Attach Business to User
      const userupdate = await tx.user.update({
        where: { id: userId },
        data: {
          role: "ADMIN",
          businessId: business.id
        }
      });
      console.log(userupdate)

      // 4️⃣ Create Default Branch
      const firstBranch = await tx.branch.create({
        data: {
          name: "Main Branch",
          businessId: business.id
        }
      });

      // 5️⃣ Issue new JWT
      const newToken = signToken(user.id, user.role, business.id)

      

      return {
        message: "Business created successfully",
        token: newToken,
        onboardingStep: 2,
        firstBranch
      };
    });
  }
}
