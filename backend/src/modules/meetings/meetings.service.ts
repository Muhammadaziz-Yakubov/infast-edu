import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingDocument, MeetingStatus } from './schemas/meeting.schema';
import { CreateMeetingMeetingDto } from './dto/create-meeting.dto';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<MeetingDocument>,
    private readonly leadsService: LeadsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(dto: CreateMeetingMeetingDto, userId: string, ip?: string): Promise<MeetingDocument> {
    const lead = await this.leadsService.findOne(dto.leadId);
    if (!lead) throw new NotFoundException('Lead topilmadi');

    const created = new this.meetingModel({
      ...dto,
      leadId: new Types.ObjectId(dto.leadId),
      teacher: new Types.ObjectId(dto.teacher),
      date: new Date(dto.date),
    });
    const saved = await created.save();

    // 1. Increment meetingCount, update lastActivityAt and increase score (+15 for scheduling)
    await this.leadsService.updateLeadScore(dto.leadId, 15);
    await this.leadsService.update(dto.leadId, {
      meetingCount: (lead.meetingCount || 0) + 1,
      lastActivityAt: new Date(),
    }, userId, ip);

    // 2. Log Activity
    await this.activitiesService.log(
      userId,
      dto.leadId,
      'MEETING_CREATED',
      'Meeting',
      undefined,
      `Uchrashuv rejalashtirildi. Sana: ${dto.date}, Soat: ${dto.time}, Joylashuv: ${dto.location}`,
      ip
    );

    return saved;
  }

  async updateStatus(id: string, status: MeetingStatus, userId: string, ip?: string): Promise<MeetingDocument> {
    const meeting = await this.meetingModel.findById(id).exec();
    if (!meeting) throw new NotFoundException('Uchrashuv topilmadi');

    const oldStatus = meeting.status;
    meeting.status = status;
    const saved = await meeting.save();

    // Score bonus (+20) if completed
    if (status === MeetingStatus.COMPLETED && oldStatus !== MeetingStatus.COMPLETED) {
      await this.leadsService.updateLeadScore(meeting.leadId, 20);
    }

    await this.leadsService.update(meeting.leadId.toString(), {
      lastActivityAt: new Date(),
    }, userId, ip);

    await this.activitiesService.log(
      userId,
      meeting.leadId.toString(),
      'MEETING_UPDATED',
      'Meeting',
      oldStatus,
      `Uchrashuv statusi o'zgartirildi: ${status}`,
      ip
    );

    return saved;
  }

  async findByLead(leadId: string): Promise<MeetingDocument[]> {
    return this.meetingModel
      .find({ leadId: new Types.ObjectId(leadId) })
      .populate('teacher', 'fullName avatar')
      .sort({ date: -1 })
      .exec();
  }
}
