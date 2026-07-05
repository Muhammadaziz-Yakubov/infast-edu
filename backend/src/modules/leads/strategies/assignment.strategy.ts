import { Types } from 'mongoose';
import { LeadDocument } from '../schemas/lead.schema';
import { UserDocument } from '../../users/schemas/user.schema';

export interface AssignmentStrategy {
  assign(lead: LeadDocument, managers: UserDocument[]): Promise<Types.ObjectId | null>;
}
