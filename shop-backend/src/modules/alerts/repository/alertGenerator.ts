import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { AlertService } from "../service/alerts.service.js";


export class AlertGenerator {
  constructor(private alertService: AlertService) {}

  async generateLowStockAlerts(branchId: string, businessId: string) {
    const items = await prisma.product.findMany({
      where: { branchId, quantity: { lte: 3 } },
    });

    for (const item of items) {
      await this.alertService.createAlert({
        businessId,
        branchId,
        type: "LOW_STOCK",
        severity: "CRITICAL",
        title: "Low Stock",
        message: `${item.name} stock is low (${item.quantity})`,
        metadata: { productId: item.id },
      });
    }
  }
  
  async generateNegativeCashAlert(branchId: string, businessId: string) {
    const cash = await prisma.cashFlow.aggregate({
      where: { branchId },
      _sum: { amount: true },
    });

    if (Number((cash._sum.amount ?? 0)) < 0) {
      await prisma.alert.create({
        data: {
          branchId,
          businessId,
          title: "Negative Cash",
          type: "SYSTEM",
          severity: "CRITICAL",
          message: "Branch cash balance is negative",
        },
      });
    }
}
 async generateOverdueLiabilityAlerts(branchId: string, businessId: string) {
    const overdue = await prisma.liability.findMany({
      where: {
        branchId,
        dueDate: { lt: new Date() },
      },
    });

    for (const liability of overdue) {
      await prisma.alert.create({
        data: {
          branchId,
          businessId,
          title: "Liability Alert",
          type: "LIABILITY_DUE",
          severity: "WARNING",
          message: `Liability overdue: ₦${liability.principalAmount}`,
        },
      });
    }
}
}