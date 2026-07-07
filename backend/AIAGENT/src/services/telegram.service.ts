import { MessageRepository } from "../database/message.repository";
import { AIService } from "./ai.service";
import { CRMService } from "./crm.service";
import { config } from "../config";
import { logger } from "../utils/logger";

export interface IncomingMessagePayload {
  message_id: string;
  chat_id: string;
  sender_id: string;
  sender_username: string;
  sender_first_name: string;
  sender_last_name: string;
  text: string;
  is_contact: boolean;
  date: string;
}

export interface SentMessagePayload {
  message_id: string;
  chat_id: string;
  sender_id: string;
  sender_username: string;
  sender_first_name: string;
  sender_last_name: string;
  text: string;
  date: string;
}

export class TelegramService {
  private messageRepository: MessageRepository;
  private aiService: AIService;
  private crmService: CRMService;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.aiService = new AIService();
    this.crmService = new CRMService();
  }

  /**
   * Processes incoming private message and determines if we should auto-reply
   */
  async handleIncomingMessage(
    payload: IncomingMessagePayload
  ): Promise<{ action: "reply" | "ignore"; text?: string }> {
    const {
      message_id,
      chat_id,
      sender_id,
      sender_username,
      sender_first_name,
      sender_last_name,
      text,
      is_contact,
    } = payload;

    const senderFullName = `${sender_first_name} ${sender_last_name}`.trim();

    logger.info(
      `[Incoming Message] From: ${senderFullName} (@${sender_username || "none"}), Chat ID: ${chat_id}`
    );

    // 1. Duplicate check
    const isDuplicate = await this.messageRepository.exists(message_id);
    if (isDuplicate) {
      logger.warn(`[Ignored] Duplicate message detected: ${message_id}`);
      return { action: "ignore" };
    }

    // 2. Save incoming message to database
    await this.messageRepository.create({
      messageId: message_id,
      chatId: chat_id,
      senderId: sender_id,
      senderName: senderFullName,
      text: text,
      direction: "incoming",
      timestamp: new Date(payload.date),
    });

    // 3. CRM Lead Check
    await this.crmService.processMessage(chat_id, text, senderFullName, sender_username);

    // 4. Auto-reply Config Check
    let shouldReply = false;
    if (is_contact) {
      shouldReply = config.AUTO_REPLY_CONTACTS;
      if (!shouldReply) {
        logger.info(`[Ignored] Auto-reply is disabled for contacts. (chat_id: ${chat_id})`);
      }
    } else {
      shouldReply = config.AUTO_REPLY_UNKNOWN;
      if (!shouldReply) {
        logger.info(`[Ignored] Auto-reply is disabled for unknown users. (chat_id: ${chat_id})`);
      }
    }

    if (!shouldReply) {
      return { action: "ignore" };
    }

    // 5. Generate AI Response
    logger.info(`[AI Generating] Crafting reply for chat: ${chat_id}...`);
    const replyText = await this.aiService.generateReply(chat_id, text);
    logger.info(`[AI Generated] Reply generated for chat: ${chat_id}`);

    return { action: "reply", text: replyText };
  }

  /**
   * Registers a message that was successfully sent by the Telegram client
   */
  async handleSentMessage(payload: SentMessagePayload): Promise<void> {
    const { message_id, chat_id, sender_id, sender_first_name, text, date } = payload;

    logger.info(`[Reply Sent] To Chat ID: ${chat_id}, Msg ID: ${message_id}`);

    // Check if already exists (safeguard)
    const exists = await this.messageRepository.exists(message_id);
    if (exists) return;

    // Save outgoing message to database
    await this.messageRepository.create({
      messageId: message_id,
      chatId: chat_id,
      senderId: sender_id,
      senderName: sender_first_name,
      text: text,
      direction: "outgoing",
      timestamp: new Date(date),
    });
  }
}
