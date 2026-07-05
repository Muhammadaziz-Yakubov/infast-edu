import { AssignmentStrategy } from './assignment.strategy';
import { LeadDocument } from '../schemas/lead.schema';
import { UserDocument } from '../../users/schemas/user.schema';
import { Types, Model } from 'mongoose';

export class LeastBusyStrategy implements AssignmentStrategy {
  constructor(private readonly leadModel: Model<LeadDocument>) {}

  async assign(lead: LeadDocument, managers: UserDocument[]): Promise<Types.ObjectId | null> {
    if (!managers || managers.length === 0) return null;

    let leastBusyManager: UserDocument | null = null;
    let minActiveLeads = Infinity;

    for (const manager of managers) {
      const activeCount = await this.leadModel.countDocuments({
        assignedManager: manager._id,
        status: { $nin: ['CONVERTED', 'CLOSED'] },
        isDeleted: { $ne: true },
      } as any).exec();

      if (activeCount < minActiveLeads) {
        minActiveLeads = activeCount;
        leastBusyManager = manager;
      }
    }

    return leastBusyManager ? (leastBusyManager._id as Types.ObjectId) : null;
  }
}
