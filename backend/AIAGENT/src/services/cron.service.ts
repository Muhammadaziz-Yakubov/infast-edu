import cron from "node-cron";
import axios from "axios";
import { config } from "../config";
import { logger } from "../utils/logger";
import { MessageRepository } from "../database/message.repository";
import { LeadRepository } from "../database/lead.repository";

export class CronService {
  private messageRepository: MessageRepository;
  private leadRepository: LeadRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.leadRepository = new LeadRepository();
  }

  /**
   * Initialize all cron jobs
   */
  start(): void {
    logger.info("Initializing background Cron tasks...");

    // 1. Health check job - runs every 10 minutes
    cron.schedule("*/10 * * * *", async () => {
      await this.checkTelegramClientHealth();
    });

    // 2. Midnight Stats Report - runs at 00:00 every day
    cron.schedule("0 0 * * *", async () => {
      await this.logDailyStats();
    });

    logger.info("Cron tasks successfully scheduled.");
  }

  /**
   * Pings the Python Telegram Client to ensure it is running and authorized
   */
  private async checkTelegramClientHealth(): Promise<void> {
    const url = `http://${config.TELEGRAM_CLIENT_HOST}:${config.TELEGRAM_CLIENT_PORT}/status`;
    try {
      logger.debug(`[Cron] Checking health of Telegram client at: ${url}`);
      const response = await axios.get(url, { timeout: 5000 });

      if (response.status === 200 && response.data.authorized) {
        logger.info(
          `[Health OK] Telegram client is connected and authorized. User: ${response.data.first_name} (@${response.data.username || "none"})`
        );
      } else {
        logger.warn(
          `[Health Warning] Telegram client is running but not authorized: ${JSON.stringify(response.data)}`
        );
      }
    } catch (error: any) {
      logger.error(
        `[Health Critical] Telegram client microservice is unreachable at ${url}. Error: ${error.message}`
      );
    }
  }

  /**
   * Gathers and logs daily activity stats
   */
  private async logDailyStats(): Promise<void> {
    try {
      logger.info("[Cron] Generating daily statistics report...");
      const msgStats = await this.messageRepository.getStats();
      const leadCount = await this.leadRepository.count();

      logger.info(
        `=== DAILY PERFORMANCE REPORT ===\n` +
          `- Total Messages Logged: ${msgStats.total}\n` +
          `- Incoming Messages: ${msgStats.incoming}\n` +
          `- AI Replies Sent: ${msgStats.outgoing}\n` +
          `- CRM Leads Captured: ${leadCount}\n` +
          `================================`
      );
    } catch (error) {
      logger.error(`[Cron] Failed to generate daily stats: ${error}`);
    }
  }
}
export const cronService = new CronService();
