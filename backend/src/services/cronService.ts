// Cron Service - Scheduled Jobs
// Runs insight generation and class reports on a schedule

import cron from 'node-cron';
import { runInsightGeneration, runClassReportGeneration } from './insightService.js';

/**
 * Initialize all cron jobs
 * Call this from server.ts on startup
 */
export function initCronJobs(): void {
    console.log('[CRON] Initializing cron jobs...');

    // Run every 5 minutes for testing (production would be '0 * * * *' for hourly)
    // Cron format: minute hour day-of-month month day-of-week
    cron.schedule('*/5 * * * *', async () => {
        console.log('\n========================================');
        console.log('[CRON] Starting scheduled insight job...');
        console.log(`[CRON] Time: ${new Date().toISOString()}`);
        console.log('========================================\n');

        try {
            // Phase 2: Generate student insights
            await runInsightGeneration();

            // Phase 3: Generate class reports (chained after Phase 2)
            await runClassReportGeneration();

            console.log('\n========================================');
            console.log('[CRON] Scheduled job complete.');
            console.log('========================================\n');
        } catch (err) {
            console.error('[CRON] Job failed:', err);
        }
    });

    console.log('[CRON] ✅ Scheduled: Insight generation every 5 minutes');
}
