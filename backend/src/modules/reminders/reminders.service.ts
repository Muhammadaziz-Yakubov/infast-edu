import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reminder, ReminderDocument, ReminderType } from './schemas/reminder.schema';

@Injectable()
export class RemindersService implements OnModuleInit, OnModuleDestroy {
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectModel(Reminder.name)
    private readonly reminderModel: Model<ReminderDocument>,
  ) {}

  onModuleInit() {
    // Run the reminder check engine on start and then every hour (3600000 ms)
    this.runReminderChecks();
    this.checkInterval = setInterval(() => {
      this.runReminderChecks();
    }, 3600000);
  }

  onModuleDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  async runReminderChecks() {
    try {
      const db = this.reminderModel.db;
      const leadModel = db.model('Lead');
      const taskModel = db.model('Task');
      const meetingModel = db.model('Meeting');
      const demoModel = db.model('DemoLesson');
      const followUpModel = db.model('FollowUp');
      const notificationModel = db.model('Notification');

      const now = new Date();
      const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Helper to dispatch alerts
      const sendNotification = async (userId: Types.ObjectId, leadId: string, title: string, message: string) => {
        const notify = new notificationModel({
          userId,
          title,
          message,
          type: 'ANNOUNCEMENT',
          read: false,
        });
        await notify.save();
      };

      // 1. NO_CALL_24H: Leads created >24h ago with callCount = 0 and not contacted
      const uncontactedLeads = await leadModel.find({
        createdAt: { $lte: oneDayAgo },
        callCount: 0,
        status: 'NEW_LEAD',
        isDeleted: { $ne: true },
        isArchived: { $ne: true },
      }).exec();

      for (const lead of uncontactedLeads) {
        const exist = await this.reminderModel.findOne({ leadId: lead._id, type: ReminderType.NO_CALL_24H }).exec();
        if (!exist && lead.assignedManager) {
          const reminder = new this.reminderModel({
            leadId: lead._id,
            title: `Qo'ng'iroq muddati o'tdi`,
            message: `Lead "${lead.firstName} ${lead.lastName}" yaratilganiga 24 soatdan oshdi, hali qo'ng'iroq qilinmagan.`,
            type: ReminderType.NO_CALL_24H,
            dueAt: new Date(),
          });
          await reminder.save();
          await sendNotification(lead.assignedManager, lead._id.toString(), reminder.title, reminder.message);
        }
      }

      // 2. MEETING_TOMORROW: Scheduled meetings for tomorrow
      const tomorrowMeetings = await meetingModel.find({
        date: { $gte: now, $lte: oneDayAhead },
        status: 'SCHEDULED',
      }).exec();

      for (const meeting of tomorrowMeetings) {
        const exist = await this.reminderModel.findOne({ leadId: meeting.leadId, type: ReminderType.MEETING_TOMORROW }).exec();
        if (!exist) {
          const lead = await leadModel.findById(meeting.leadId).exec();
          if (lead && lead.assignedManager) {
            const reminder = new this.reminderModel({
              leadId: meeting.leadId,
              title: `Ertaga uchrashuv mavjud`,
              message: `Lead "${lead.firstName} ${lead.lastName}" bilan ertaga soat ${meeting.time} da uchrashuv belgilangan.`,
              type: ReminderType.MEETING_TOMORROW,
              dueAt: new Date(),
            });
            await reminder.save();
            await sendNotification(lead.assignedManager, lead._id.toString(), reminder.title, reminder.message);
          }
        }
      }

      // 3. DEMO_TOMORROW: Demo lessons scheduled for tomorrow
      const tomorrowDemos = await demoModel.find({
        date: { $gte: now, $lte: oneDayAhead },
      }).exec();

      for (const demo of tomorrowDemos) {
        const exist = await this.reminderModel.findOne({ leadId: demo.leadId, type: ReminderType.DEMO_TOMORROW }).exec();
        if (!exist) {
          const lead = await leadModel.findById(demo.leadId).exec();
          if (lead && lead.assignedManager) {
            const reminder = new this.reminderModel({
              leadId: demo.leadId,
              title: `Ertaga Demo Dars`,
              message: `Lead "${lead.firstName} ${lead.lastName}" uchun ertaga Demo dars rejalashtirilgan.`,
              type: ReminderType.DEMO_TOMORROW,
              dueAt: new Date(),
            });
            await reminder.save();
            await sendNotification(lead.assignedManager, lead._id.toString(), reminder.title, reminder.message);
          }
        }
      }

      // 4. OVERDUE_TASK: Overdue pending tasks
      const overdueTasks = await taskModel.find({
        dueDate: { $lte: now },
        status: 'PENDING',
      }).exec();

      for (const task of overdueTasks) {
        const exist = await this.reminderModel.findOne({ leadId: task.leadId, type: ReminderType.OVERDUE_TASK }).exec();
        if (!exist) {
          const lead = await leadModel.findById(task.leadId).exec();
          if (lead && lead.assignedManager) {
            const reminder = new this.reminderModel({
              leadId: task.leadId,
              title: `Muddati o'tgan vazifa`,
              message: `Lead "${lead.firstName} ${lead.lastName}" uchun belgilangan "${task.title}" vazifa muddati o'tdi.`,
              type: ReminderType.OVERDUE_TASK,
              dueAt: new Date(),
            });
            await reminder.save();
            await sendNotification(lead.assignedManager, lead._id.toString(), reminder.title, reminder.message);
          }
        }
      }

      // 5. COLD_LEAD: Leads with no activity in 14 days
      const coldLeads = await leadModel.find({
        lastActivityAt: { $lte: fourteenDaysAgo },
        status: { $nin: ['CONVERTED', 'CLOSED'] },
        isDeleted: { $ne: true },
        isArchived: { $ne: true },
      }).exec();

      for (const lead of coldLeads) {
        const exist = await this.reminderModel.findOne({ leadId: lead._id, type: ReminderType.COLD_LEAD }).exec();
        if (!exist) {
          // Update tag to COLD_LEAD and decrease score by 20 points
          lead.tags = Array.from(new Set([...lead.tags, 'COLD_LEAD']));
          lead.score = Math.max(0, lead.score - 20);
          await lead.save();

          if (lead.assignedManager) {
            const reminder = new this.reminderModel({
              leadId: lead._id,
              title: `Sovuq Lead (Cold Lead)`,
              message: `Lead "${lead.firstName} ${lead.lastName}" bilan 14 kundan beri hech qanday harakat qayd etilmagan.`,
              type: ReminderType.COLD_LEAD,
              dueAt: new Date(),
            });
            await reminder.save();
            await sendNotification(lead.assignedManager, lead._id.toString(), reminder.title, reminder.message);
          }
        }
      }

      // 6. FOLLOW_UP_TODAY: Follow ups scheduled for today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const todayFollowUps = await followUpModel.find({
        date: { $gte: todayStart, $lte: todayEnd },
        status: 'PENDING',
      }).exec();

      for (const fu of todayFollowUps) {
        const exist = await this.reminderModel.findOne({ leadId: fu.leadId, type: ReminderType.FOLLOW_UP_TODAY }).exec();
        if (!exist) {
          const lead = await leadModel.findById(fu.leadId).exec();
          if (lead && lead.assignedManager) {
            const reminder = new this.reminderModel({
              leadId: fu.leadId,
              title: `Bugun Follow Up mavjud`,
              message: `Lead "${lead.firstName} ${lead.lastName}" bilan bugun soat ${fu.time} da Follow up rejalashtirilgan. Sabab: ${fu.reason}`,
              type: ReminderType.FOLLOW_UP_TODAY,
              dueAt: new Date(),
            });
            await reminder.save();
            await sendNotification(lead.assignedManager, lead._id.toString(), reminder.title, reminder.message);
          }
        }
      }

    } catch (e) {
      console.error('Reminder check engine failure:', e.message);
    }
  }

  async findAll(): Promise<Reminder[]> {
    return this.reminderModel.find().populate('leadId').exec();
  }

  async findByLead(leadId: string): Promise<Reminder[]> {
    return this.reminderModel.find({ leadId: new Types.ObjectId(leadId) }).exec();
  }
}
