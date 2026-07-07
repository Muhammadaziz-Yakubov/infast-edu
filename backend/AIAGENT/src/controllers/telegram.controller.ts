import { Request, Response } from "express";
import { TelegramService } from "../services/telegram.service";
import { processManager } from "../services/processManager";
import { logger } from "../utils/logger";

export class TelegramController {
  private telegramService: TelegramService;

  constructor() {
    this.telegramService = new TelegramService();
  }

  /**
   * Handler for incoming Telegram messages webhook
   */
  handleIncoming = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;

      // Simple validation
      if (
        !payload.message_id ||
        !payload.chat_id ||
        !payload.sender_id ||
        payload.text === undefined
      ) {
        res.status(400).json({ error: "Invalid webhook payload structure" });
        return;
      }

      const result = await this.telegramService.handleIncomingMessage(payload);
      res.status(200).json(result);
    } catch (error) {
      logger.error(`Error in TelegramController.handleIncoming: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Handler for notifications of sent replies
   */
  handleSent = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;

      if (!payload.message_id || !payload.chat_id || !payload.sender_id || !payload.text) {
        res.status(400).json({ error: "Invalid sent payload structure" });
        return;
      }

      await this.telegramService.handleSentMessage(payload);
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(`Error in TelegramController.handleSent: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Get Telegram client connection status
   */
  getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await processManager.getStatus();
      res.status(200).json(status);
    } catch (error) {
      logger.error(`Error in TelegramController.getStatus: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Start the Telegram microservice process
   */
  startAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      processManager.start();
      res.status(200).json({ success: true, message: "Telegram agent starting process initiated." });
    } catch (error) {
      logger.error(`Error in TelegramController.startAgent: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Stop the Telegram microservice process
   */
  stopAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      await processManager.stop();
      res.status(200).json({ success: true, message: "Telegram agent process stopped." });
    } catch (error) {
      logger.error(`Error in TelegramController.stopAgent: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Submit OTP / Login Code to Telegram client stdin
   */
  submitCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.body;
      if (!code) {
        res.status(400).json({ error: "Code is required" });
        return;
      }
      processManager.sendInput(code);
      res.status(200).json({ success: true, message: "Code submitted successfully to agent." });
    } catch (error) {
      logger.error(`Error in TelegramController.submitCode: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Logout and clear Telegram session
   */
  logoutAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const success = await processManager.logout();
      res.status(200).json({ success });
    } catch (error) {
      logger.error(`Error in TelegramController.logoutAgent: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
