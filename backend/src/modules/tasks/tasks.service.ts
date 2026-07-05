import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    private readonly leadsService: LeadsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(dto: CreateTaskDto, userId: string, ip?: string): Promise<TaskDocument> {
    const lead = await this.leadsService.findOne(dto.leadId);
    if (!lead) throw new NotFoundException('Lead topilmadi');

    const task = new this.taskModel({
      ...dto,
      leadId: new Types.ObjectId(dto.leadId),
      dueDate: new Date(dto.dueDate),
    });
    const saved = await task.save();

    await this.leadsService.update(dto.leadId, { lastActivityAt: new Date() }, userId, ip);

    // Activity Log
    await this.activitiesService.log(
      userId,
      dto.leadId,
      'TASK_CREATED',
      'Task',
      undefined,
      `Yangi vazifa yaratildi: "${dto.title}". Muddati: ${dto.dueDate}`,
      ip
    );

    return saved;
  }

  async updateStatus(id: string, status: TaskStatus, userId: string, ip?: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Vazifa topilmadi');

    const oldStatus = task.status;
    task.status = status;
    const saved = await task.save();

    await this.leadsService.update(task.leadId.toString(), { lastActivityAt: new Date() }, userId, ip);

    await this.activitiesService.log(
      userId,
      task.leadId.toString(),
      'TASK_UPDATED',
      'Task',
      oldStatus,
      `Vazifa statusi o'zgartirildi: ${status}`,
      ip
    );

    return saved;
  }

  async findByLead(leadId: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({ leadId: new Types.ObjectId(leadId) })
      .sort({ dueDate: 1 })
      .exec();
  }

  async remove(id: string, userId: string, ip?: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Vazifa topilmadi');

    const deleted = await this.taskModel.findByIdAndDelete(id).exec();

    await this.activitiesService.log(
      userId,
      task.leadId.toString(),
      'TASK_DELETED',
      'Task',
      undefined,
      `Vazifa o'chirildi: "${task.title}"`,
      ip
    );

    return deleted!;
  }
}
