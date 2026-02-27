import cron from 'node-cron';
import { AlertRepository } from '../modules/alerts/repository/alerts.repository.js';

const alertRepo = new AlertRepository();

// Run once a day at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('Cleaning up old resolved alerts...');
    const deleted = await alertRepo.deleteOldResolved(30); // delete older than 30 days
    console.log(`Deleted ${deleted.count} old resolved alerts.`);
  } catch (err) {
    console.error('Error in cleanup cron:', err);
  }
});