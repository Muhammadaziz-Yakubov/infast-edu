import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
  ) {}

  async log(
    userId: string | Types.ObjectId,
    leadId: string | Types.ObjectId,
    action: string,
    entity: string,
    oldValue?: string,
    newValue?: string,
    ip?: string,
  ): Promise<ActivityDocument> {
    const logEntry = new this.activityModel({
      user: new Types.ObjectId(userId),
      leadId: new Types.ObjectId(leadId),
      action,
      entity,
      oldValue,
      newValue,
      ip,
    });
    return logEntry.save();
  }

  async findByLead(leadId: string): Promise<ActivityDocument[]> {
    return this.activityModel
      .find({ leadId: new Types.ObjectId(leadId) })
      .populate('user', 'fullName avatar role')
      .sort({ timestamp: -1 })
      .exec();
  }
}
