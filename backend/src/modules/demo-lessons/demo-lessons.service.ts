import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DemoLesson, DemoLessonDocument, DemoResult } from './schemas/demo-lesson.schema';
import { CreateDemoLessonDto } from './dto/create-demo-lesson.dto';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class DemoLessonsService {
  constructor(
    @InjectModel(DemoLesson.name)
    private readonly demoLessonModel: Model<DemoLessonDocument>,
    private readonly leadsService: LeadsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(dto: CreateDemoLessonDto, userId: string, ip?: string): Promise<DemoLessonDocument> {
    const lead = await this.leadsService.findOne(dto.leadId);
    if (!lead) throw new NotFoundException('Lead topilmadi');

    const created = new this.demoLessonModel({
      ...dto,
      leadId: new Types.ObjectId(dto.leadId),
      course: new Types.ObjectId(dto.course),
      teacher: new Types.ObjectId(dto.teacher),
      date: new Date(dto.date),
    });
    const saved = await created.save();

    // 1. Update Lead stats, score (+30 if attended)
    const scoreBonus = dto.attendance ? 30 : 0;
    if (scoreBonus > 0) {
      await this.leadsService.updateLeadScore(dto.leadId, scoreBonus);
    }

    await this.leadsService.update(dto.leadId, {
      demoCount: (lead.demoCount || 0) + 1,
      demoDate: new Date(dto.date),
      lastActivityAt: new Date(),
    }, userId, ip);

    // 2. Log Activity
    await this.activitiesService.log(
      userId,
      dto.leadId,
      'DEMO_LESSON',
      'DemoLesson',
      undefined,
      `Demo dars qayd etildi. Natija: ${dto.result}, Qatnashdi: ${dto.attendance ? 'Ha' : 'Yo\'q'}, Fikr: ${dto.feedback || 'yo\'q'}`,
      ip
    );

    return saved;
  }

  async findByLead(leadId: string): Promise<DemoLessonDocument[]> {
    return this.demoLessonModel
      .find({ leadId: new Types.ObjectId(leadId) })
      .populate('course', 'name')
      .populate('teacher', 'fullName avatar')
      .sort({ date: -1 })
      .exec();
  }
}
