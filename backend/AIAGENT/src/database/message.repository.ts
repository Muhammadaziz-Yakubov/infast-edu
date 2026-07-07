import { MessageModel, IMessage } from "../models/message.model";

export class MessageRepository {
  /**
   * Save a new message
   */
  async create(data: Partial<IMessage>): Promise<IMessage> {
    const message = new MessageModel(data);
    return await message.save();
  }

  /**
   * Check if a message with the given messageId exists
   */
  async exists(messageId: string): Promise<boolean> {
    const count = await MessageModel.countDocuments({ messageId });
    return count > 0;
  }

  /**
   * Get the last N messages for a specific chat, ordered chronologically (oldest first)
   */
  async getChatHistory(chatId: string, limit: number = 20): Promise<IMessage[]> {
    const messages = await MessageModel.find({ chatId }).sort({ timestamp: -1 }).limit(limit);

    // Return chronologically (oldest to newest)
    return messages.reverse();
  }

  /**
   * Get overall message statistics
   */
  async getStats(): Promise<{ total: number; incoming: number; outgoing: number }> {
    const total = await MessageModel.countDocuments();
    const incoming = await MessageModel.countDocuments({ direction: "incoming" });
    const outgoing = await MessageModel.countDocuments({ direction: "outgoing" });

    return { total, incoming, outgoing };
  }
}
