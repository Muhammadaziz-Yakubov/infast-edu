import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CallLog, CallLogDocument } from './schemas/call-log.schema';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class CallsService {
  constructor(
    @InjectModel(CallLog.name)
    private readonly callLogModel: Model<CallLogDocument>,
    private readonly leadsService: LeadsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(dto: CreateCallLogDto, managerId: string, ip?: string): Promise<CallLogDocument> {
    const lead = await this.leadsService.findOne(dto.leadId);
    if (!lead) throw new NotFoundException('Lead topilmadi');

    const created = new this.callLogModel({
      ...dto,
      leadId: new Types.ObjectId(dto.leadId),
      manager: new Types.ObjectId(managerId),
      date: new Date(),
    });
    const saved = await created.save();

    // 1. Increment call count & update activity indicators & score (+5) on Lead
    await this.leadsService.updateLeadScore(dto.leadId, 5);
    await this.leadsService.update(dto.leadId, {
      callCount: (lead.callCount || 0) + 1,
      lastContactAt: new Date(),
      lastActivityAt: new Date()
    }, managerId, ip);

    // 2. Log Activity
    await this.activitiesService.log(
      managerId,
      dto.leadId,
      'CALL_LOGGED',
      'CallLog',
      undefined,
      `Qo'ng'iroq qayd etildi. Natija: ${dto.result}, Davomiyligi: ${dto.duration}s. Eslatma: ${dto.notes || 'yo\'q'}`,
      ip
    );

    return saved;
  }

  async findByLead(leadId: string): Promise<CallLogDocument[]> {
    return this.callLogModel
      .find({ leadId: new Types.ObjectId(leadId) })
      .populate('manager', 'fullName avatar')
      .sort({ date: -1 })
      .exec();
  }
}
