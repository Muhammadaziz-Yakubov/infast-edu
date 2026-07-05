import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FollowUp, FollowUpDocument, FollowUpStatus } from './schemas/follow-up.schema';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class FollowUpsService {
  constructor(
    @InjectModel(FollowUp.name)
    private readonly followUpModel: Model<FollowUpDocument>,
    private readonly leadsService: LeadsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(dto: CreateFollowUpDto, userId: string, ip?: string): Promise<FollowUpDocument> {
    const lead = await this.leadsService.findOne(dto.leadId);
    if (!lead) throw new NotFoundException('Lead topilmadi');

    const created = new this.followUpModel({
      ...dto,
      leadId: new Types.ObjectId(dto.leadId),
      assignedManager: new Types.ObjectId(dto.assignedManager),
      date: new Date(dto.date),
    });
    const saved = await created.save();

    // Update Lead's nextFollowUpAt & lastActivityAt
    await this.leadsService.update(dto.leadId, {
      nextFollowUpAt: new Date(dto.date),
      lastActivityAt: new Date(),
    }, userId, ip);

    // Log Activity
    await this.activitiesService.log(
      userId,
      dto.leadId,
      'FOLLOW_UP_CREATED',
      'FollowUp',
      undefined,
      `Yangi follow-up belgilandi. Sana: ${dto.date}, Soat: ${dto.time}, Sabab: "${dto.reason}"`,
      ip
    );

    return saved;
  }

  async updateStatus(id: string, status: FollowUpStatus, userId: string, ip?: string): Promise<FollowUpDocument> {
    const followUp = await this.followUpModel.findById(id).exec();
    if (!followUp) throw new NotFoundException('Follow-up topilmadi');

    const oldStatus = followUp.status;
    followUp.status = status;
    if (status === FollowUpStatus.COMPLETED) {
      followUp.completedAt = new Date();
    } else {
      followUp.completedAt = undefined;
    }
    const saved = await followUp.save();

    // Re-calculate the next soonest pending follow-up date for this lead
    await this.recalculateNextFollowUp(followUp.leadId.toString(), userId, ip);

    await this.activitiesService.log(
      userId,
      followUp.leadId.toString(),
      'FOLLOW_UP_UPDATED',
      'FollowUp',
      oldStatus,
      `Follow-up statusi o'zgartirildi: ${status}`,
      ip
    );

    return saved;
  }

  async recalculateNextFollowUp(leadId: string, userId: string, ip?: string) {
    const nextPending = await this.followUpModel
      .findOne({
        leadId: new Types.ObjectId(leadId),
        status: FollowUpStatus.PENDING,
      })
      .sort({ date: 1 })
      .exec();

    await this.leadsService.update(leadId, {
      nextFollowUpAt: nextPending ? nextPending.date : null,
      lastActivityAt: new Date(),
    }, userId, ip);
  }

  async findByLead(leadId: string): Promise<FollowUpDocument[]> {
    return this.followUpModel
      .find({ leadId: new Types.ObjectId(leadId) })
      .populate('assignedManager', 'fullName avatar')
      .sort({ date: 1 })
      .exec();
  }

  async findByManager(managerId: string, status?: FollowUpStatus): Promise<FollowUpDocument[]> {
    const filter: any = { assignedManager: new Types.ObjectId(managerId) };
    if (status) filter.status = status;
    return this.followUpModel.find(filter).populate('leadId').sort({ date: 1 }).exec();
  }
}
