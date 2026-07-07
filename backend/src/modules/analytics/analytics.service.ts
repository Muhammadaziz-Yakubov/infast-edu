import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { StudentProfile, StudentProfileDocument } from '../students/schemas/student-profile.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Attendance, AttendanceDocument } from '../attendance/schemas/attendance.schema';
import { Role } from '../../common/enums/roles.enum';
import { UserStatus, PaymentStatus, AttendanceStatus } from '../../common/enums/status.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Attendance.name) private readonly attendanceModel: Model<AttendanceDocument>
  ) {}

  async getDashboardStats(user?: any, targetBranchId?: string): Promise<any> {
    let userFilter: any = { role: Role.STUDENT };
    let studentIds: Types.ObjectId[] = [];
    const isBranchAdmin = user && user.role === Role.BRANCH_ADMIN;
    const isSuperAdmin = user && user.role === Role.SUPER_ADMIN;

    if (isBranchAdmin) {
      userFilter.branchId = new Types.ObjectId(user.branchId);
      // Fetch all student user IDs for this branch
      const branchUsers = await this.userModel.find({ branchId: new Types.ObjectId(user.branchId) }).select('_id').exec();
      studentIds = branchUsers.map(u => u._id);
    } else if (isSuperAdmin) {
      if (targetBranchId) {
        userFilter.branchId = new Types.ObjectId(targetBranchId);
        // Fetch all student user IDs for target branch
        const branchUsers = await this.userModel.find({ branchId: new Types.ObjectId(targetBranchId) }).select('_id').exec();
        studentIds = branchUsers.map(u => u._id);
      } else {
        userFilter.branchId = { $in: [null, undefined] };
        // Fetch all student user IDs for main branch
        const branchUsers = await this.userModel.find({ branchId: { $in: [null, undefined] } as any }).select('_id').exec();
        studentIds = branchUsers.map(u => u._id);
      }
    }

    // 1. Student counts — real DB
    const totalStudents = await this.userModel.countDocuments(userFilter).exec();
    const activeStudents = await this.userModel.countDocuments({ ...userFilter, status: UserStatus.ACTIVE }).exec();
    const blockedStudents = await this.userModel.countDocuments({ ...userFilter, status: UserStatus.BLOCKED }).exec();

    // 2. Monthly revenue — real payments, sum of PAID with real amounts in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const paymentFilter: any = {
      paymentDate: { $gte: thirtyDaysAgo },
      status: PaymentStatus.PAID,
      amount: { $gt: 0 },
    };
    if (isBranchAdmin) {
      paymentFilter.studentId = { $in: studentIds };
    }

    const revenueResult = await this.paymentModel.aggregate([
      { $match: paymentFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).exec();
    const monthlyRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 3. Total courses
    const totalCourses = await this.courseModel.countDocuments().exec();

    // 4. Attendance rate — real data, no fallback
    const attendanceFilter: any = {};
    if (isBranchAdmin) {
      attendanceFilter.studentId = { $in: studentIds };
    }
    const totalAttendance = await this.attendanceModel.countDocuments(attendanceFilter).exec();
    const presentAttendance = await this.attendanceModel.countDocuments({ ...attendanceFilter, status: AttendanceStatus.PRESENT }).exec();
    const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

    // 5. Revenue history — last 6 months (real data, no mock fallback)
    const monthsUz = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    const revenueHistory: any[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const historyFilter: any = {
        paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: PaymentStatus.PAID,
        amount: { $gt: 0 },
      };
      if (isBranchAdmin) {
        historyFilter.studentId = { $in: studentIds };
      }

      const monthRevenue = await this.paymentModel.aggregate([
        { $match: historyFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).exec();

      revenueHistory.push({
        month: monthsUz[d.getMonth()],
        revenue: monthRevenue.length > 0 ? monthRevenue[0].total : 0,
      });
    }

    // 6. Student growth — last 6 months (cumulative real count)
    const studentGrowth: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const growthFilter: any = {
        role: Role.STUDENT,
        createdAt: { $lte: endOfMonth },
      };
      if (isBranchAdmin) {
        growthFilter.branchId = new Types.ObjectId(user.branchId);
      }

      const count = await this.userModel.countDocuments(growthFilter).exec();

      studentGrowth.push({
        month: monthsUz[d.getMonth()],
        students: count,
      });
    }

    // 7. Course distribution — real enrollment per course (no mock)
    const courses = await this.courseModel.find().exec();
    const courseDistribution = await Promise.all(
      courses.map(async (course) => {
        const profileFilter: any = { courseId: course._id };
        if (isBranchAdmin) {
          profileFilter.userId = { $in: studentIds };
        }
        const enrollmentCount = await this.studentProfileModel.countDocuments(profileFilter).exec();
        return { name: course.title, students: enrollmentCount };
      })
    );

    // 8. Recent activities — only real DB events (no fake fallback)
    const recentActivities: any[] = [];

    const userQuery: any = { role: Role.STUDENT };
    if (isBranchAdmin) {
      userQuery.branchId = new Types.ObjectId(user.branchId);
    }
    const latestUsers = await this.userModel.find(userQuery).sort({ createdAt: -1 }).limit(4).exec();

    const paymentQuery: any = { status: PaymentStatus.PAID, amount: { $gt: 0 } };
    if (isBranchAdmin) {
      paymentQuery.studentId = { $in: studentIds };
    }
    const latestPayments = await this.paymentModel
      .find(paymentQuery)
      .sort({ paymentDate: -1 })
      .limit(4)
      .populate('studentId')
      .exec();

    for (const u of latestUsers) {
      const createdAt = (u as any).createdAt as Date;
      if (!createdAt) continue;
      const diffMs = Math.abs(now.getTime() - createdAt.getTime());
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      let timeStr = `${diffMins} daqiqa oldin`;
      if (diffDays > 0) timeStr = `${diffDays} kun oldin`;
      else if (diffHours > 0) timeStr = `${diffHours} soat oldin`;

      recentActivities.push({
        id: `user-${u._id}`,
        message: `Yangi talaba ${u.fullName || u.email} ro'yxatdan o'tdi`,
        time: timeStr,
        timestamp: createdAt.getTime(),
      });
    }

    for (const p of latestPayments) {
      const studentName = (p.studentId as any)?.fullName || 'Talaba';
      const diffMs = Math.abs(now.getTime() - p.paymentDate.getTime());
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      let timeStr = `${diffMins} daqiqa oldin`;
      if (diffDays > 0) timeStr = `${diffDays} kun oldin`;
      else if (diffHours > 0) timeStr = `${diffHours} soat oldin`;

      recentActivities.push({
        id: `pay-${p._id}`,
        message: `${studentName} tomonidan ${p.amount.toLocaleString()} UZS to'lov qilindi`,
        time: timeStr,
        timestamp: p.paymentDate.getTime(),
      });
    }

    recentActivities.sort((a, b) => b.timestamp - a.timestamp);
    const finalActivities = recentActivities.slice(0, 6).map(({ id, message, time }) => ({ id, message, time }));

    return {
      totalStudents,
      activeStudents,
      blockedStudents,
      monthlyRevenue,
      totalCourses,
      attendanceRate,
      revenueHistory,
      studentGrowth,
      courseDistribution,
      recentActivities: finalActivities,
    };
  }
}
