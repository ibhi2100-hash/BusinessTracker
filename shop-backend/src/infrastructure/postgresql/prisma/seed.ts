import { prisma } from "../prismaClient.js";

async function main() {

  await prisma.subscriptionPlan.createMany({
    data: [
      {
        id: "starter",
        name: "Starter",
        price: 0,
        billingCycle: "monthly",
        maxUsers: 1,
        maxBranch: 1,
        maxProduct: 50,
        maxStaff: 2,
        features: {
          inventory: true,
          cashflow: true
        }
      },
      {
        id: "growth",
        name: "Growth",
        price: 5000,
        billingCycle: "monthly",
        maxUsers: 10,
        maxBranch: 5,
        maxProduct: 500,
        maxStaff: 20,
        features: {
          inventory: true,
          analytics: true,
          reports: true
        }
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 15000,
        billingCycle: "monthly",
        maxUsers: 100,
        maxBranch: 50,
        maxProduct: 10000,
        maxStaff: 200,
        features: {
          api: true,
          analytics: true,
          reports: true
        }
      }
    ]
  });

}

main()
  .then(() => {
    console.log("Seed completed");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });