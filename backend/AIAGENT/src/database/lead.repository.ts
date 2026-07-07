import { LeadModel, ILead } from "../models/lead.model";

export class LeadRepository {
  /**
   * Create or update a CRM lead based on chatId
   */
  async upsert(chatId: string, data: Partial<ILead>): Promise<ILead> {
    return (await LeadModel.findOneAndUpdate(
      { chatId },
      {
        $set: {
          name: data.name,
          username: data.username,
          lastMessage: data.lastMessage,
        },
        $addToSet: {
          keywordsMatched: { $each: data.keywordsMatched || [] },
        },
      },
      { new: true, upsert: true }
    )) as ILead;
  }

  /**
   * Find a lead by chatId
   */
  async findByChatId(chatId: string): Promise<ILead | null> {
    return await LeadModel.findOne({ chatId });
  }

  /**
   * Get all leads
   */
  async findAll(limit: number = 100): Promise<ILead[]> {
    return await LeadModel.find().sort({ updatedAt: -1 }).limit(limit);
  }

  /**
   * Update lead status
   */
  async updateStatus(
    chatId: string,
    status: "new" | "contacted" | "converted"
  ): Promise<ILead | null> {
    return await LeadModel.findOneAndUpdate({ chatId }, { $set: { status } }, { new: true });
  }

  /**
   * Get total count of leads
   */
  async count(): Promise<number> {
    return await LeadModel.countDocuments();
  }
}
