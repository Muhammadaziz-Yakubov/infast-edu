import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Schemas
import { User, UserDocument } from '../users/schemas/user.schema';
import { Group, GroupDocument } from '../groups/schemas/group.schema';
import { Lead, LeadDocument } from '../leads/schemas/lead.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Attendance, AttendanceDocument } from '../attendance/schemas/attendance.schema';
import { Campaign, CampaignDocument } from '../campaigns/schemas/campaign.schema';
import { HomeworkSubmission, HomeworkSubmissionDocument } from '../homework/schemas/homework-submission.schema';
import { LessonProgress, LessonProgressDocument } from '../lms/schemas/lesson-progress.schema';
import { Meeting, MeetingDocument } from '../meetings/schemas/meeting.schema';
import { DemoLesson, DemoLessonDocument } from '../demo-lessons/schemas/demo-lesson.schema';
import { Homework, HomeworkDocument } from '../homework/schemas/homework.schema';
import { LeadSource, LeadSourceDocument } from '../lead-sources/schemas/lead-source.schema';

// Enums
import { Role } from '../../common/enums/roles.enum';
import { UserStatus, PaymentStatus } from '../../common/enums/status.enum';

interface AIRecommendation {
  priority: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY';
  category: 'GROUP' | 'ATTENDANCE' | 'STUDENT' | 'TEACHER' | 'FINANCE' | 'MARKETING';
  problem: string;
  rootCause: string;
  businessImpact: string;
  recommendation: string;
  suggestedActions: string[];
  timestamp: string;
}

@Injectable()
export class AiAdvisorService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Attendance.name) private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Campaign.name) private readonly campaignModel: Model<CampaignDocument>,
    @InjectModel(HomeworkSubmission.name) private readonly homeworkSubmissionModel: Model<HomeworkSubmissionDocument>,
    @InjectModel(LessonProgress.name) private readonly lessonProgressModel: Model<LessonProgressDocument>,
    @InjectModel(Meeting.name) private readonly meetingModel: Model<MeetingDocument>,
    @InjectModel(DemoLesson.name) private readonly demoLessonModel: Model<DemoLessonDocument>,
    @InjectModel(Homework.name) private readonly homeworkModel: Model<HomeworkDocument>,
    @InjectModel(LeadSource.name) private readonly leadSourceModel: Model<LeadSourceDocument>,
  ) {}

  async getDashboardInsights(): Promise<any> {
    const timestamp = new Date().toISOString();

    // 1. Fetch data from DB
    const [
      groups,
      students,
      payments,
      attendance,
      leads,
      meetings,
      demoLessons,
      homeworks,
      submissions,
      progress,
    ] = await Promise.all([
      this.groupModel.find().populate('courseId').exec(),
      this.userModel.find({ role: Role.STUDENT, status: UserStatus.ACTIVE }).exec(),
      this.paymentModel.find().exec(),
      this.attendanceModel.find().exec(),
      this.leadModel.find({ isDeleted: { $ne: true } }).populate('source').populate('campaign').exec(),
      this.meetingModel.find().populate('teacher').exec(),
      this.demoLessonModel.find().populate('teacher').exec(),
      this.homeworkModel.find().exec(),
      this.homeworkSubmissionModel.find().exec(),
      this.lessonProgressModel.find().exec(),
    ]);

    // Aggregate structured recommendations
    const recommendations: AIRecommendation[] = [];

    // --- HEALTH SCORE & SUMMARY ---
    let healthScore: number | "Insufficient data" = "Insufficient data";
    let aiSummary = "Insufficient data to calculate center health summary.";

    const metricsForHealth: number[] = [];
    
    // 1.1 Calculate Attendance Rate
    let avgAttendanceRate: number | null = null;
    if (attendance.length > 0) {
      const present = attendance.filter((a) => a.status === 'PRESENT').length;
      avgAttendanceRate = present / attendance.length;
      metricsForHealth.push(avgAttendanceRate * 100);
    }

    // 1.2 Calculate Lead Conversion Rate
    let leadConvRate: number | null = null;
    if (leads.length > 0) {
      const converted = leads.filter((l) => l.status === 'CONVERTED').length;
      leadConvRate = converted / leads.length;
      metricsForHealth.push(leadConvRate * 100);
    }

    // 1.3 Calculate On-time Payment Rate
    let payRate: number | null = null;
    const paidPayments = payments.filter((p) => p.status === PaymentStatus.PAID);
    const unpaidPayments = payments.filter((p) => p.status === PaymentStatus.OVERDUE || p.status === PaymentStatus.UNPAID);
    if (paidPayments.length + unpaidPayments.length > 0) {
      payRate = paidPayments.length / (paidPayments.length + unpaidPayments.length);
      metricsForHealth.push(payRate * 100);
    }

    if (metricsForHealth.length >= 2) {
      const sum = metricsForHealth.reduce((acc, v) => acc + v, 0);
      healthScore = Math.round(sum / metricsForHealth.length);

      if (healthScore >= 80) {
        aiSummary = `The center is performing optimally with a health score of ${healthScore}%. Attendance is high, lead conversion is strong, and payment collections are healthy. Focus on expansion.`;
      } else if (healthScore >= 50) {
        aiSummary = `The center performance is moderate at ${healthScore}%. There are active alerts regarding low-enrolled groups and attendance dropouts that require prompt attention.`;
      } else {
        aiSummary = `Action required: Center health score has dropped to ${healthScore}%. Critical risks detected in group occupancy, overdue cash flow, and high student attrition.`;
      }
    }

    // --- GROUP RISK & ANALYSIS ---
    const groupRisks: any[] = [];
    if (groups.length === 0) {
      groupRisks.push({ message: "Insufficient data" });
    } else {
      for (const group of groups) {
        const studentCount = group.students ? group.students.length : 0;
        if (studentCount <= 3) {
          const rec: AIRecommendation = {
            priority: 'CRITICAL',
            category: 'GROUP',
            problem: `Group "${group.name}" has critical low enrollment (${studentCount} students).`,
            rootCause: `Slow student sign-ups or lack of marketing for the class level.`,
            businessImpact: `Low margins. Teacher salary and room costs exceed tuition revenue.`,
            recommendation: `Merge this group with another group running the same course, or move class to a smaller slot.`,
            suggestedActions: [
              `Review course schedule to find compatible groups for merge.`,
              `Contact inactive leads interested in course level.`,
              `Propose online/hybrid class option to students.`,
            ],
            timestamp,
          };
          recommendations.push(rec);
          groupRisks.push({
            groupId: group._id,
            groupName: group.name,
            studentCount,
            status: 'CRITICAL',
            recommendation: rec.recommendation,
          });
        } else if (studentCount <= 5) {
          const rec: AIRecommendation = {
            priority: 'WARNING',
            category: 'GROUP',
            problem: `Group "${group.name}" has sub-optimal enrollment (${studentCount} students).`,
            rootCause: `Low conversion from demo lessons for this course tier.`,
            businessImpact: `Lower resource efficiency.`,
            recommendation: `Launch a targeted marketing drive or follow up with leads marked for demo lessons.`,
            suggestedActions: [
              `Filter CRM leads matching course level.`,
              `Create a special offer for remaining seats.`,
            ],
            timestamp,
          };
          recommendations.push(rec);
          groupRisks.push({
            groupId: group._id,
            groupName: group.name,
            studentCount,
            status: 'WARNING',
            recommendation: rec.recommendation,
          });
        } else {
          groupRisks.push({
            groupId: group._id,
            groupName: group.name,
            studentCount,
            status: 'HEALTHY',
            recommendation: 'No action required.',
          });
        }
      }
    }

    // --- ATTENDANCE TREND ANALYSIS ---
    const attendanceAlerts: any[] = [];
    const uniqueDates = Array.from(new Set(attendance.map(a => new Date(a.date).toDateString())));
    
    if (uniqueDates.length < 3) {
      attendanceAlerts.push({ message: "Not enough historical information" });
    } else {
      // Analyze attendance changes by group
      for (const group of groups) {
        const groupAttendance = attendance.filter(a => a.groupId.toString() === group._id.toString());
        if (groupAttendance.length < 6) continue;

        // Sort by date ascending
        groupAttendance.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const midPoint = Math.floor(groupAttendance.length / 2);
        const firstHalf = groupAttendance.slice(0, midPoint);
        const secondHalf = groupAttendance.slice(midPoint);

        const prevRate = firstHalf.filter(a => a.status === 'PRESENT').length / firstHalf.length;
        const recentRate = secondHalf.filter(a => a.status === 'PRESENT').length / secondHalf.length;

        if (recentRate < prevRate - 0.1) {
          const rec: AIRecommendation = {
            priority: recentRate < 0.6 ? 'CRITICAL' : 'WARNING',
            category: 'ATTENDANCE',
            problem: `Group "${group.name}" exhibits declining attendance rate from ${Math.round(prevRate * 100)}% to ${Math.round(recentRate * 100)}%.`,
            rootCause: `Failing engagement or material difficulty hike.`,
            businessImpact: `High correlation with future student churn and lost tuition.`,
            recommendation: `Speak with the class teacher to check course pace, and contact absent students.`,
            suggestedActions: [
              `Teacher to call parents of students absent for 2 consecutive lessons.`,
              `Schedule an optional review/support class.`,
            ],
            timestamp,
          };
          recommendations.push(rec);
          attendanceAlerts.push({
            groupName: group.name,
            prevRate: Math.round(prevRate * 100),
            recentRate: Math.round(recentRate * 100),
            status: recentRate < 0.6 ? 'CRITICAL' : 'WARNING',
          });
        }
      }
    }

    // --- STUDENT RISK ---
    const studentRisks: any[] = [];
    if (students.length === 0) {
      studentRisks.push({ message: "Insufficient data" });
    } else {
      for (const student of students) {
        const reasons: string[] = [];
        const actions: string[] = [];

        // 1. Attendance Check
        const studAtt = attendance.filter(a => a.studentId.toString() === student._id.toString());
        let attScore = 1;
        if (studAtt.length >= 3) {
          const present = studAtt.filter(a => a.status === 'PRESENT').length;
          attScore = present / studAtt.length;
          if (attScore < 0.7) {
            reasons.push(`Low Attendance (${Math.round(attScore * 100)}%)`);
            actions.push(`Call parent/student to inquire about attendance drop.`);
          }
        }

        // 2. Late Payment Check
        const studPayments = payments.filter(p => p.studentId.toString() === student._id.toString());
        const latePay = studPayments.some(p => p.status === PaymentStatus.OVERDUE || p.status === PaymentStatus.UNPAID);
        if (latePay) {
          reasons.push('Overdue Payment');
          actions.push('Contact student to request pending tuition fee.');
        }

        // 3. Homework Check
        const studSubmissions = submissions.filter(s => s.studentId.toString() === student._id.toString());
        // Find group student belongs to
        const studGroup = groups.find(g => g.students.some(id => id.toString() === student._id.toString()));
        let hwRate = 1;
        if (studGroup && homeworks.length > 0) {
          // Homeworks linked to group lessons
          const groupHomeworks = homeworks.filter(h => h.lessonId);
          if (groupHomeworks.length > 0) {
            const submittedCount = studSubmissions.length;
            hwRate = submittedCount / groupHomeworks.length;
            if (hwRate < 0.5) {
              reasons.push(`Low Homework Submission (${Math.round(hwRate * 100)}%)`);
              actions.push(`Assign support assistant to review incomplete homeworks.`);
            }
          }
        }

        // 4. Low Quiz Scores & App Inactivity
        const studProgress = progress.filter(p => p.studentId.toString() === student._id.toString());
        if (studProgress.length > 0) {
          const testScores = studProgress.filter(p => p.testCompleted && p.score !== undefined).map(p => p.score);
          if (testScores.length > 0) {
            const avgScore = testScores.reduce((acc, v) => acc + v, 0) / testScores.length;
            if (avgScore < 60) {
              reasons.push(`Low Quiz Performance (${Math.round(avgScore)}% average)`);
              actions.push(`Provide revision worksheets for failed quiz modules.`);
            }
          }

          // Last activity date check
          const dates = studProgress.map(p => (p as any).updatedAt ? new Date((p as any).updatedAt).getTime() : 0);
          const lastActive = Math.max(...dates);
          if (lastActive > 0) {
            const daysSinceActive = (new Date().getTime() - lastActive) / (1000 * 60 * 60 * 24);
            if (daysSinceActive > 14) {
              reasons.push(`No App Activity in ${Math.round(daysSinceActive)} days`);
              actions.push(`Send push notification or automated SMS reminder to log back in.`);
            }
          }
        }

        if (reasons.length > 0) {
          const riskPriority = reasons.length >= 3 ? 'CRITICAL' : (reasons.length === 2 ? 'WARNING' : 'OPPORTUNITY');
          const rec: AIRecommendation = {
            priority: riskPriority,
            category: 'STUDENT',
            problem: `Student "${student.fullName}" shows high churn risk indicators: ${reasons.join(', ')}.`,
            rootCause: `Low platform engagement or academic/financial friction.`,
            businessImpact: `Potential loss of customer lifetime value.`,
            recommendation: `Reach out to ${student.fullName} directly to coordinate support action.`,
            suggestedActions: actions,
            timestamp,
          };
          recommendations.push(rec);
          studentRisks.push({
            studentId: student._id,
            studentName: student.fullName,
            groupName: studGroup ? studGroup.name : 'Unassigned',
            riskLevel: riskPriority,
            reasons,
          });
        }
      }
    }

    // --- TEACHER ANALYSIS ---
    const teacherInsights: any[] = [];
    const activeTeachers = await this.userModel.find({ role: Role.TEACHER, status: UserStatus.ACTIVE }).exec();

    if (activeTeachers.length === 0) {
      teacherInsights.push({ message: "Insufficient data" });
    } else {
      for (const teacher of activeTeachers) {
        const teacherMeetings = meetings.filter(m => m.teacher?.toString() === teacher._id.toString() || (m.teacher as any)?._id?.toString() === teacher._id.toString());
        const teacherDemos = demoLessons.filter(d => d.teacher?.toString() === teacher._id.toString() || (d.teacher as any)?._id?.toString() === teacher._id.toString());

        if (teacherMeetings.length === 0 && teacherDemos.length === 0) {
          teacherInsights.push({
            teacherName: teacher.fullName,
            metrics: {
              meetingsCompleted: "Insufficient data",
              demoConversionRate: "Insufficient data",
              homeworkSpeed: "Insufficient data (no group/grading association found)",
              studentRetention: "Insufficient data (no group/grading association found)",
              quizPerformance: "Insufficient data (no group/grading association found)",
            }
          });
        } else {
          // Calculate Completed Meetings
          const totalMeetings = teacherMeetings.length;
          const completedMeetings = teacherMeetings.filter(m => m.status === 'COMPLETED').length;
          const meetingsRate = totalMeetings > 0 ? `${completedMeetings}/${totalMeetings} (${Math.round((completedMeetings / totalMeetings) * 100)}%)` : "No meetings";

          // Calculate Demo conversion rate
          const totalDemos = teacherDemos.length;
          // In conversions lead phone matches student phone
          let convertedDemos = 0;
          for (const d of teacherDemos) {
            // Find if lead associated was converted
            const matchLead = leads.find(l => l._id.toString() === d.leadId?.toString());
            if (matchLead && matchLead.status === 'CONVERTED') {
              convertedDemos++;
            }
          }
          const demoConv = totalDemos > 0 ? `${convertedDemos}/${totalDemos} (${Math.round((convertedDemos / totalDemos) * 100)}%)` : "No demo classes";

          teacherInsights.push({
            teacherName: teacher.fullName,
            metrics: {
              meetingsCompleted: meetingsRate,
              demoConversionRate: demoConv,
              homeworkSpeed: "Insufficient data (no group/grading association found)",
              studentRetention: "Insufficient data (no group/grading association found)",
              quizPerformance: "Insufficient data (no group/grading association found)",
            }
          });

          // Check if meeting completion is low
          if (totalMeetings >= 3 && (completedMeetings / totalMeetings) < 0.75) {
            recommendations.push({
              priority: 'WARNING',
              category: 'TEACHER',
              problem: `Teacher "${teacher.fullName}" has low meeting attendance/completion rate (${Math.round((completedMeetings / totalMeetings) * 100)}%).`,
              rootCause: `Scheduling conflicts or administrative lag.`,
              businessImpact: `Delayed conversion pipelines and client dissatisfaction.`,
              recommendation: `Confirm schedule constraints with teacher and verify calendar sync.`,
              suggestedActions: [
                `Review teacher meeting log.`,
                `Confirm teacher availability hours in settings.`,
              ],
              timestamp,
            });
          }
        }
      }
    }

    // --- FINANCE INSIGHTS ---
    let financeInsights: any = {
      paidRevenue: "Insufficient data",
      overdueDebt: "Insufficient data",
      upcomingExpected: "Insufficient data",
    };
    let potentialRevenueLoss: number | "Insufficient data" = "Insufficient data";

    if (payments.length > 0) {
      const paid = payments.filter(p => p.status === PaymentStatus.PAID).reduce((acc, p) => acc + p.amount, 0);
      const overdue = payments.filter(p => p.status === PaymentStatus.OVERDUE || p.status === PaymentStatus.UNPAID).reduce((acc, p) => acc + p.amount, 0);
      const upcoming = payments.filter(p => p.status === PaymentStatus.UPCOMING).reduce((acc, p) => acc + p.amount, 0);

      financeInsights = {
        paidRevenue: paid,
        overdueDebt: overdue,
        upcomingExpected: upcoming,
      };

      potentialRevenueLoss = overdue;

      if (overdue > 1000000) { // e.g. amount in sum/currency threshold
        recommendations.push({
          priority: 'CRITICAL',
          category: 'FINANCE',
          problem: `Accumulated tuition debt has reached ${overdue.toLocaleString()} UZS.`,
          rootCause: `Late payments and lack of follow-up on overdue invoices.`,
          businessImpact: `Negative cash flow impact and reduced operational liquidity.`,
          recommendation: `Implement automated reminders and request staff to call debtors.`,
          suggestedActions: [
            `Send automated payment reminders to active debtors.`,
            `Freeze access for accounts overdue by more than 15 days.`,
          ],
          timestamp,
        });
      }
    }

    // --- MARKETING INSIGHTS ---
    let marketingInsights: any = {
      leadConversionRate: "Insufficient data",
      bestTrafficSources: [],
      campaignPerformance: [],
    };

    if (leads.length > 0) {
      const convertedCount = leads.filter(l => l.status === 'CONVERTED').length;
      const leadConvRatePct = Math.round((convertedCount / leads.length) * 100);

      // Best traffic sources
      const sourcesMap: { [key: string]: { count: number; converted: number } } = {};
      for (const l of leads) {
        const sourceName = l.source ? (l.source as any).name || 'Direct / Organic' : 'Direct / Organic';
        if (!sourcesMap[sourceName]) {
          sourcesMap[sourceName] = { count: 0, converted: 0 };
        }
        sourcesMap[sourceName].count++;
        if (l.status === 'CONVERTED') {
          sourcesMap[sourceName].converted++;
        }
      }

      const sortedSources = Object.keys(sourcesMap).map(key => ({
        source: key,
        count: sourcesMap[key].count,
        converted: sourcesMap[key].converted,
        rate: Math.round((sourcesMap[key].converted / sourcesMap[key].count) * 100),
      })).sort((a, b) => b.converted - a.converted).slice(0, 3);

      // Campaign performance
      const campaignsMap: { [key: string]: { count: number; converted: number } } = {};
      for (const l of leads) {
        if (!l.campaign) continue;
        const campName = (l.campaign as any).name || 'Unknown';
        if (!campaignsMap[campName]) {
          campaignsMap[campName] = { count: 0, converted: 0 };
        }
        campaignsMap[campName].count++;
        if (l.status === 'CONVERTED') {
          campaignsMap[campName].converted++;
        }
      }

      const campaignsPerf = Object.keys(campaignsMap).map(key => ({
        campaign: key,
        count: campaignsMap[key].count,
        converted: campaignsMap[key].converted,
        rate: Math.round((campaignsMap[key].converted / campaignsMap[key].count) * 100),
      }));

      marketingInsights = {
        leadConversionRate: `${leadConvRatePct}%`,
        bestTrafficSources: sortedSources.length > 0 ? sortedSources : "Insufficient data",
        campaignPerformance: campaignsPerf.length > 0 ? campaignsPerf : "Insufficient data",
      };

      // Opportunity alert: highlight top traffic source
      if (sortedSources.length > 0 && sortedSources[0].rate > 35) {
        recommendations.push({
          priority: 'OPPORTUNITY',
          category: 'MARKETING',
          problem: `High conversion efficiency detected from source "${sortedSources[0].source}" (${sortedSources[0].rate}%).`,
          rootCause: `Strong market-channel fit.`,
          businessImpact: `Possibility to scale conversions by increasing advertising spend on this channel.`,
          recommendation: `Re-allocate marketing budget towards ${sortedSources[0].source}.`,
          suggestedActions: [
            `Increase weekly spend on ${sortedSources[0].source}.`,
            `Analyze demographics of converted leads from this source.`,
          ],
          timestamp,
        });
      }
    }

    // --- TREND ANALYSIS ---
    // Calculate sign-ups month by month
    const trendAnalysis: any[] = [];
    if (leads.length === 0) {
      trendAnalysis.push({ message: "Insufficient data" });
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlySignups: { [key: string]: number } = {};
      for (const l of leads) {
        const d = new Date((l as any).createdAt);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlySignups[key] = (monthlySignups[key] || 0) + 1;
      }
      Object.keys(monthlySignups).forEach(month => {
        trendAnalysis.push({
          label: month,
          signups: monthlySignups[month],
        });
      });
    }

    // --- AGGREGATE SUMMARY CATEGORIES ---
    const criticalAlerts = recommendations.filter(r => r.priority === 'CRITICAL');
    const warnings = recommendations.filter(r => r.priority === 'WARNING');
    const opportunities = recommendations.filter(r => r.priority === 'OPPORTUNITY');

    const recommendedActionsSet = new Set<string>();
    recommendations.forEach(r => r.suggestedActions.forEach(a => recommendedActionsSet.add(a)));

    return {
      healthScore,
      aiSummary,
      criticalAlerts,
      warnings,
      opportunities,
      potentialRevenueLoss,
      studentRisks: studentRisks.length > 0 ? studentRisks : [{ message: "Insufficient data" }],
      groupRisks,
      teacherInsights,
      financeInsights,
      marketingInsights,
      trendAnalysis,
      recommendedActions: Array.from(recommendedActionsSet),
    };
  }
}
