import cron from 'node-cron';
import { AlertGenerator } from '../modules/alerts/service/alertGenerator.js';
import { prisma } from '../infrastructure/postgresql/prismaClient.js';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('Running low-stock and negative cash alerts...');

    const generator = new AlertGenerator();

    // Fetch all active branches
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, businessId: true }
    });

    for (const branch of branches) {
      // Generate low stock alerts
      await generator.generateLowStockAlerts(branch.id, branch.businessId);

      // Generate negative cash alerts
      await generator.generateNegativeCashAlert(branch.id, branch.businessId);

      // Generate overdue liabilities alerts
      await generator.generateOverdueLiabilityAlerts(branch.id, branch.businessId);
    }

    console.log('Alerts job finished successfully.');
  } catch (err) {
    console.error('Error running alerts cron:', err);
  }
});