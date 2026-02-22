import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { CreateBusinessDto } from "../dto/businessReg.dto.js";
import { signTokenWithExpiry } from "../../../helpers/jwtHelper/jwthelper.js";
import { OpeningBalanceDto } from "../dto/openingBalance.dto.js";
import { PrismaClient } from "@prisma/client/extension";
import { sourceMapsEnabled } from "node:process";
import { AuthService } from "../../auth/service/auth.service.js";

export class OnboardingService {
  constructor(private authService: AuthService){}
  

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
          businessId: business.id,
          onboardingCompleted: true,
          
        }
      });

      // 4️⃣ Create Default Branch
      const firstBranch = await tx.branch.create({
        data: {
          name: "Main Branch",
          businessId: business.id
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      // 5️⃣ Issue new JWT
      const { token , expiresIn} = signTokenWithExpiry(user.id, user.role, business.id, firstBranch.id )

      

      return {
        message: "Business created successfully",
        token: token,
        expiresIn,
        onboardingStep: 2,
        firstBranch
      };
    });
  }

  async setOpeningBalance(
    dto: OpeningBalanceDto,
    businessId: string
  ){
      const total = 
        (dto.cashInHand ||  0) +
        (dto.bankBalance || 0 ) + 
        (dto.posBalance || 0)

        if(total <= 0 ) {
          throw new Error("Opening balance must be greater than zero");
        }

        return prisma.$transaction(async (tx: PrismaClient)=> {
          const flows = [];

          if(dto.cashInHand > 0){
            flows.push({
              businessId,
              branchId: dto.branchId,
              type: "INFLOW",
              amount: dto.cashInHand,
              source: "Opening Balance",
              description: "Cash in hand at onboarding"
              
            })
          }

           if (dto.bankBalance) {
        flows.push({
          businessId,
          branchId: dto.branchId,
          type: "INFLOW",
          amount: dto.bankBalance,
          source: "Opening Balance",
          description: "Bank balance at onboarding"
        });
      }
      if (dto.posBalance) {
        flows.push({
          businessId,
          branchId: dto.branchId,
          type: "INFLOW",
          amount: dto.posBalance,
          source: "Opening Balance",
          description: "POS balance at onboarding"
        });
      }
      await tx.cashFlow.createMany({
        data: flows
      });

      return {
        totalOpeningBalance: total
      };
        })
  }
}
