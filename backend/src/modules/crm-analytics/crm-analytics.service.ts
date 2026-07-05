import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lead, LeadDocument } from '../leads/schemas/lead.schema';
import { Campaign, CampaignDocument } from '../campaigns/schemas/campaign.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role } from '../../common/enums/roles.enum';

@Injectable()
export class CrmAnalyticsService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
    @InjectModel(Campaign.name) private readonly campaignModel: Model<CampaignDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getDashboardStats(): Promise<any> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const db = this.leadModel.db;
    const callLogModel = db.model('CallLog');
    const meetingModel = db.model('Meeting');
    const demoModel = db.model('DemoLesson');
    const followUpModel = db.model('FollowUp');
    const taskModel = db.model('Task');
    const paymentModel = db.model('Payment');

    // 1. Basic Counts
    const totalLeads = await this.leadModel.countDocuments({ isDeleted: { $ne: true } } as any).exec();
    const newLeadsToday = await this.leadModel.countDocuments({ isDeleted: { $ne: true }, createdAt: { $gte: startOfToday } } as any).exec();
    const contacted = await this.leadModel.countDocuments({ isDeleted: { $ne: true }, status: 'CONTACTED' } as any).exec();
    const demoLessons = await this.leadModel.countDocuments({ isDeleted: { $ne: true }, status: 'DEMO_LESSON' } as any).exec();
    const converted = await this.leadModel.countDocuments({ isDeleted: { $ne: true }, status: 'CONVERTED' } as any).exec();
    const lost = await this.leadModel.countDocuments({ isDeleted: { $ne: true }, status: 'CLOSED', lostReason: { $exists: true } } as any).exec();

    const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

    // 2. Today's metrics
    const todaysCalls = await callLogModel.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday } }).exec();
    const todaysMeetings = await meetingModel.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday } }).exec();
    const todaysDemos = await demoModel.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday } }).exec();

    // 3. Pending task & follow-ups
    const pendingFollowUps = await followUpModel.countDocuments({ status: 'PENDING', date: { $lte: endOfToday } }).exec();
    const overdueTasks = await taskModel.countDocuments({ status: 'PENDING', dueDate: { $lte: now } }).exec();
    const coldLeads = await this.leadModel.countDocuments({ isDeleted: { $ne: true }, tags: 'COLD_LEAD', status: { $nin: ['CONVERTED', 'CLOSED'] } } as any).exec();

    // 4. MoM Lead Velocity Rate (LVR)
    const countThisMonth = await this.leadModel.countDocuments({ isDeleted: { $ne: true }, createdAt: { $gte: startOfThisMonth } } as any).exec();
    const countLastMonth = await this.leadModel.countDocuments({ isDeleted: { $ne: true }, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } as any).exec();
    const lvr = countLastMonth > 0 ? Math.round(((countThisMonth - countLastMonth) / countLastMonth) * 100) : 100;

    // 5. CAC (Customer Acquisition Cost)
    const campaignsBudget = await this.campaignModel.aggregate([
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ]).exec();
    const totalBudget = campaignsBudget.length > 0 ? campaignsBudget[0].total : 0;
    const cac = converted > 0 ? Math.round(totalBudget / converted) : 0;

    // 6. CLV (Customer Lifetime Value - average payments made by active students)
    const studentPaymentsSum = await paymentModel.aggregate([
      { $match: { status: 'PAID', amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]).exec();
    const totalRevenue = studentPaymentsSum.length > 0 ? studentPaymentsSum[0].total : 0;
    const paymentCount = studentPaymentsSum.length > 0 ? studentPaymentsSum[0].count : 0;
    const clv = paymentCount > 0 ? Math.round(totalRevenue / paymentCount) : 0;

    // 7. Top Campaign & Source
    const topCampaignAgg = await this.leadModel.aggregate([
      { $match: { campaign: { $ne: null }, isDeleted: { $ne: true } } },
      { $group: { _id: '$campaign', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).exec();
    let topCampaign = 'Yo\'q';
    if (topCampaignAgg.length > 0) {
      const camp = await this.campaignModel.findById(topCampaignAgg[0]._id).exec();
      if (camp) topCampaign = camp.name;
    }

    const topSourceAgg = await this.leadModel.aggregate([
      { $match: { source: { $ne: null }, isDeleted: { $ne: true } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).exec();
    let topSource = 'Yo\'q';
    if (topSourceAgg.length > 0) {
      const srcModel = db.model('LeadSource');
      const src = await srcModel.findById(topSourceAgg[0]._id).exec();
      if (src) topSource = src.name;
    }

    return {
      totalLeads,
      newLeadsToday,
      contacted,
      demoLessons,
      convertedStudents: converted,
      conversionRate,
      lostLeads: lost,
      todaysCalls,
      todaysMeetings,
      todaysDemos,
      pendingFollowUps,
      overdueTasks,
      coldLeads,
      lvr,
      cac,
      clv,
      topCampaign,
      topSource,
    };
  }

  async getFunnelDropoff(): Promise<any[]> {
    const statuses = ['NEW_LEAD', 'CONTACTED', 'MEETING_SCHEDULED', 'DEMO_LESSON', 'REGISTERED', 'CONVERTED', 'CLOSED'];
    const results: any[] = [];

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      const count = await this.leadModel.countDocuments({ status, isDeleted: { $ne: true } } as any).exec();
      results.push({
        stage: status,
        count,
      });
    }
    return results;
  }

  async getLostReasons(): Promise<any[]> {
    return this.leadModel.aggregate([
      { $match: { status: 'CLOSED', lostReason: { $exists: true }, isDeleted: { $ne: true } } },
      { $group: { _id: '$lostReason', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).exec();
  }

  async getCourseAnalytics(): Promise<any[]> {
    const db = this.leadModel.db;
    const courseModel = db.model('Course');
    const courses = await courseModel.find().exec();

    const results: any[] = [];
    for (const course of courses) {
      const total = await this.leadModel.countDocuments({ interestedCourse: course._id, isDeleted: { $ne: true } } as any).exec();
      const converted = await this.leadModel.countDocuments({ interestedCourse: course._id, status: 'CONVERTED', isDeleted: { $ne: true } } as any).exec();
      results.push({
        courseName: course.name,
        leadsCount: total,
        convertedCount: converted,
        conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
      });
    }
    return results;
  }

  async getManagersPerformance(): Promise<any[]> {
    const managers = await this.userModel.find({ role: { $in: [Role.MANAGER, Role.SUPER_ADMIN, Role.RECEPTION] } }).exec();
    const results: any[] = [];

    const db = this.leadModel.db;
    const callLogModel = db.model('CallLog');
    const meetingModel = db.model('Meeting');
    const demoModel = db.model('DemoLesson');
    const paymentModel = db.model('Payment');
    const studentProfileModel = db.model('StudentProfile');

    for (const m of managers) {
      const assigned = await this.leadModel.countDocuments({ assignedManager: m._id, isDeleted: { $ne: true } } as any).exec();
      const conversions = await this.leadModel.countDocuments({ assignedManager: m._id, status: 'CONVERTED', isDeleted: { $ne: true } } as any).exec();
      const lost = await this.leadModel.countDocuments({ assignedManager: m._id, status: 'CLOSED', isDeleted: { $ne: true } } as any).exec();

      const calls = await callLogModel.countDocuments({ manager: m._id }).exec();
      const meetings = await meetingModel.countDocuments({ teacher: m._id }).exec();
      const demos = await demoModel.countDocuments({ teacher: m._id }).exec();

      // Estimate revenue generated
      const leads = await this.leadModel.find({ assignedManager: m._id, status: 'CONVERTED' } as any, { phone: 1 }).exec();
      const phones = leads.map(l => l.phone);
      const profiles = await studentProfileModel.find({ studentPhone: { $in: phones } }).exec();
      const uids = profiles.map(p => p.userId);

      const payments = await paymentModel.aggregate([
        { $match: { studentId: { $in: uids }, status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).exec();
      const revenue = payments.length > 0 ? payments[0].total : 0;

      // Avg Closing Time (days from creation to conversion)
      const convertedLeads = await this.leadModel.find({
        assignedManager: m._id,
        status: 'CONVERTED',
        convertedAt: { $ne: null },
        isDeleted: { $ne: true }
      } as any).exec();

      let totalDays = 0;
      convertedLeads.forEach((lead: any) => {
        const diff = (lead.convertedAt!.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        totalDays += diff;
      });
      const avgClosingTime = convertedLeads.length > 0 ? Math.round(totalDays / convertedLeads.length) : 0;

      results.push({
        managerName: m.fullName,
        avatar: m.avatar,
        assignedLeads: assigned,
        callsCount: calls,
        meetingsCount: meetings,
        demosCount: demos,
        conversionsCount: conversions,
        lostCount: lost,
        revenue,
        conversionRate: assigned > 0 ? Math.round((conversions / assigned) * 100) : 0,
        avgClosingTimeDays: avgClosingTime,
      });
    }

    return results;
  }
}
