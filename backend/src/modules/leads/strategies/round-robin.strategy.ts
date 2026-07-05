import { AssignmentStrategy } from './assignment.strategy';
import { LeadDocument } from '../schemas/lead.schema';
import { UserDocument } from '../../users/schemas/user.schema';
import { Types, Model } from 'mongoose';

export class RoundRobinStrategy implements AssignmentStrategy {
  constructor(private readonly leadModel: Model<LeadDocument>) {}

  async assign(lead: LeadDocument, managers: UserDocument[]): Promise<Types.ObjectId | null> {
    if (!managers || managers.length === 0) return null;

    // Sort managers by ID to ensure a stable sequence
    const sortedManagers = [...managers].sort((a, b) => 
      a._id.toString().localeCompare(b._id.toString())
    );

    // Find the most recently created lead that has an assigned manager
    const lastLead = await this.leadModel
      .findOne({ assignedManager: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 })
      .exec();

    if (!lastLead || !lastLead.assignedManager) {
      // Default to first manager
      return sortedManagers[0]._id as Types.ObjectId;
    }

    const lastManagerId = lastLead.assignedManager.toString();
    const lastIndex = sortedManagers.findIndex(m => m._id.toString() === lastManagerId);

    // If last manager is not in the list, default to first, else get next (with wrap-around)
    const nextIndex = lastIndex === -1 ? 0 : (lastIndex + 1) % sortedManagers.length;
    return sortedManagers[nextIndex]._id as Types.ObjectId;
  }
}
