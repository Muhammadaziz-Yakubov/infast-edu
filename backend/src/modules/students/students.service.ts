import { Injectable, NotFoundException, ConflictException, ForbiddenException, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudentProfile, StudentProfileDocument } from './schemas/student-profile.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Group, GroupDocument } from '../groups/schemas/group.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Role } from '../../common/enums/roles.enum';
import { UserStatus, PaymentStatus } from '../../common/enums/status.enum';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import * as bcrypt from 'bcrypt';

import { Contract, ContractDocument } from './schemas/contract.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { GenerateContractDto } from './dto/generate-contract.dto';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class StudentsService implements OnModuleInit {
  constructor(
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Contract.name)
    private readonly contractModel: Model<ContractDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    private readonly botService: TelegramBotService
  ) {}

  async onModuleInit() {
    // Run DB consistency check immediately on start
    await this.syncDatabaseConsistency();
  }

  async syncDatabaseConsistency(): Promise<void> {
    try {
      const profiles = await this.studentProfileModel.find().exec();
      const groups = await this.groupModel.find().exec();

      // 1. Group to Student consistency
      for (const group of groups) {
        const studentIdsInGroup = group.students.map((s) => s.toString());
        const validStudentIds: Types.ObjectId[] = [];

        for (const sId of studentIdsInGroup) {
          const profile = await this.studentProfileModel.findOne({ userId: new Types.ObjectId(sId) }).exec();
          if (profile && profile.groupId && profile.groupId.toString() === group._id.toString()) {
            validStudentIds.push(new Types.ObjectId(sId));
          }
        }

        if (group.students.length !== validStudentIds.length) {
          group.students = validStudentIds;
          await group.save();
        }
      }

      // 2. Student to Group consistency
      for (const profile of profiles) {
        if (profile.groupId) {
          const group = await this.groupModel.findById(profile.groupId).exec();
          if (!group) {
            profile.groupId = undefined;
            await profile.save();
          } else {
            const studentIds = group.students.map((s) => s.toString());
            if (!studentIds.includes(profile.userId.toString())) {
              group.students.push(profile.userId);
              await group.save();
            }
          }
        }
      }
    } catch (e) {
      console.error('Database consistency sync failed:', e.message);
    }
  }

  async calculateStudentPaymentStatus(userId: Types.ObjectId | string): Promise<string> {
    const latestPayment = await this.paymentModel
      .findOne({ studentId: new Types.ObjectId(userId) })
      .sort({ paymentDate: -1 })
      .exec();

    if (!latestPayment) {
      return 'UNPAID';
    }

    const now = new Date();
    const nextPay = new Date(latestPayment.nextPaymentDate);
    const fiveDaysBefore = new Date(nextPay);
    fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);

    if (now >= nextPay) {
      return 'OVERDUE';
    } else if (now >= fiveDaysBefore && now < nextPay) {
      return 'UPCOMING';
    } else {
      return 'PAID';
    }
  }

  async createProfile(userId: string | Types.ObjectId): Promise<StudentProfileDocument> {
    const profile = new this.studentProfileModel({
      userId: new Types.ObjectId(userId),
    });
    return profile.save();
  }

  // Returns student profile with fully populated groupId (including startLessonOrder) for auth responses
  async getStudentProfileForAuth(userId: string): Promise<any> {
    const profile = await this.studentProfileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('groupId')   // full group object with startLessonOrder
      .populate('courseId')
      .exec();

    if (!profile) return null;
    const pObj = profile.toObject();
    return pObj;
  }


  async findAll(requestingUser?: any, targetBranchId?: string): Promise<any[]> {
    let filter = {};
    if (requestingUser) {
      if (requestingUser.role === Role.BRANCH_ADMIN) {
        const branchUsers = await this.userModel.find({ branchId: new Types.ObjectId(requestingUser.branchId) }).select('_id').exec();
        const userIds = branchUsers.map(u => u._id);
        filter = { userId: { $in: userIds } };
      } else if (requestingUser.role === Role.SUPER_ADMIN) {
        if (targetBranchId) {
          const branchUsers = await this.userModel.find({ branchId: new Types.ObjectId(targetBranchId) }).select('_id').exec();
          const userIds = branchUsers.map(u => u._id);
          filter = { userId: { $in: userIds } };
        } else {
          const branchUsers = await this.userModel.find({ branchId: { $in: [null, undefined] } as any }).select('_id').exec();
          const userIds = branchUsers.map(u => u._id);
          filter = { userId: { $in: userIds } };
        }
      }
    }

    const profiles = await this.studentProfileModel
      .find(filter)
      .populate('userId')
      .populate('groupId')
      .populate('courseId')
      .exec();

    return Promise.all(
      profiles.map(async (p) => {
        const pObj = p.toObject();
        const user = pObj.userId as any;
        const dynamicStatus = await this.calculateStudentPaymentStatus(user?._id || pObj.userId);
        return {
          _id: user?._id?.toString() || pObj._id?.toString(),
          fullName: user?.fullName || 'Noma\'lum Talaba',
          label: user?.label || '',
          email: user?.email || '',
          studentPhone: pObj.studentPhone || user?.studentPhone || user?.phone || '',
          parentPhone: pObj.parentPhone || '',
          dateOfBirth: pObj.dateOfBirth || '',
          avatar: user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName || 'student'}`,
          courseId: pObj.courseId?._id?.toString() || pObj.courseId?.toString() || '',
          groupId: pObj.groupId?._id?.toString() || pObj.groupId?.toString() || '',
          xp: pObj.xp || 0,
          coins: pObj.coins || 0,
          level: pObj.level || 1,
          paymentStatus: dynamicStatus,
          status: user?.status || 'ACTIVE',
        };
      })
    );
  }


  async createStudent(createStudentDto: CreateStudentDto, creator: any): Promise<any> {
    const { email, studentPhone, parentPhone, dateOfBirth, fullName, avatar, groupId, courseId, password, branchId } = createStudentDto;

    // Check existing by studentPhone or email
    const queryOr: any[] = [{ phone: studentPhone }, { studentPhone }];
    if (email) {
      queryOr.push({ email });
    }
    const existing = await this.userModel.findOne({ $or: queryOr });
    if (existing) {
      throw new ConflictException('Email or student phone already registered');
    }

    // Use custom password if provided, otherwise generate default password: DDMMYYYY format from DD.MM.YYYY
    const defaultPassword = password || dateOfBirth.replace(/\./g, '');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    let finalBranchId: Types.ObjectId | undefined = undefined;
    if (creator.role === Role.BRANCH_ADMIN) {
      finalBranchId = new Types.ObjectId(creator.branchId);
    } else if (creator.role === Role.SUPER_ADMIN) {
      finalBranchId = undefined; // Super Admin acts as main branch admin
    } else if (branchId) {
      finalBranchId = new Types.ObjectId(branchId);
    }

    const user = new this.userModel({
      fullName,
      email: email || undefined,
      phone: studentPhone,
      studentPhone,
      parentPhone,
      dateOfBirth,
      mustChangePassword: true,
      password: hashedPassword,
      avatar,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE, // Default active for newly created student by admin
      label: createStudentDto.label || undefined,
      branchId: finalBranchId,
    });
    const savedUser = await user.save();

    const profile = new this.studentProfileModel({
      userId: savedUser._id,
      studentPhone,
      parentPhone,
      dateOfBirth,
      mustChangePassword: true,
      groupId: groupId ? new Types.ObjectId(groupId) : undefined,
      courseId: courseId ? new Types.ObjectId(courseId) : undefined,
      paymentStatus: PaymentStatus.UNPAID,
    });
    const savedProfile = await profile.save();

    // Create initial payment tracking if nextPaymentDate is specified
    if (createStudentDto.nextPaymentDate) {
      const nextPayDate = new Date(createStudentDto.nextPaymentDate);
      const newPayment = new this.paymentModel({
        studentId: savedUser._id,
        amount: 0,
        paymentDate: new Date(),
        nextPaymentDate: nextPayDate,
        status: PaymentStatus.PAID,
      });
      await newPayment.save();
    }

    // ✅ Sync: add student to group.students[] roster
    if (groupId) {
      await this.groupModel.findByIdAndUpdate(
        groupId,
        { $addToSet: { students: savedUser._id } },
        { new: true }
      ).exec();
    }

    // Notify bot
    this.botService.notifyStudentCreated(savedUser).catch(() => {});

    return {
      user: savedUser,
      profile: savedProfile,
      generatedPassword: defaultPassword,
    };
  }

  async updateStudent(userId: string, updateStudentDto: UpdateStudentDto, requestingUser?: any): Promise<any> {
    const userExists = await this.userModel.findById(userId);
    if (!userExists) {
      throw new NotFoundException('Student user not found');
    }

    if (requestingUser) {
      if (requestingUser.role === Role.BRANCH_ADMIN && (!userExists.branchId || userExists.branchId.toString() !== requestingUser.branchId)) {
        throw new ForbiddenException('You do not have access to this student');
      }
    }

    // Split updates into user and profile
    const userUpdates: any = {};
    if (updateStudentDto.fullName !== undefined) userUpdates.fullName = updateStudentDto.fullName;
    if (updateStudentDto.phone !== undefined) userUpdates.phone = updateStudentDto.phone;
    if (updateStudentDto.studentPhone !== undefined) {
      userUpdates.studentPhone = updateStudentDto.studentPhone;
      userUpdates.phone = updateStudentDto.studentPhone; // sync core login phone field
    }
    if (updateStudentDto.parentPhone !== undefined) userUpdates.parentPhone = updateStudentDto.parentPhone;
    if (updateStudentDto.dateOfBirth !== undefined) userUpdates.dateOfBirth = updateStudentDto.dateOfBirth;
    if (updateStudentDto.mustChangePassword !== undefined) userUpdates.mustChangePassword = updateStudentDto.mustChangePassword;
    if (updateStudentDto.email !== undefined) userUpdates.email = updateStudentDto.email;
    if (updateStudentDto.avatar !== undefined) userUpdates.avatar = updateStudentDto.avatar;
    if (updateStudentDto.status !== undefined) userUpdates.status = updateStudentDto.status;
    if (updateStudentDto.label !== undefined) userUpdates.label = updateStudentDto.label;
    if (updateStudentDto.branchId !== undefined) {
      userUpdates.branchId = updateStudentDto.branchId ? new Types.ObjectId(updateStudentDto.branchId) : null;
    }
    if (updateStudentDto.password !== undefined) {
      userUpdates.password = await bcrypt.hash(updateStudentDto.password, 10);
    }

    if (Object.keys(userUpdates).length > 0) {
      await this.userModel.findByIdAndUpdate(userId, userUpdates).exec();
    }

    const profileUpdates: any = {};
    if (updateStudentDto.studentPhone !== undefined) profileUpdates.studentPhone = updateStudentDto.studentPhone;
    if (updateStudentDto.parentPhone !== undefined) profileUpdates.parentPhone = updateStudentDto.parentPhone;
    if (updateStudentDto.dateOfBirth !== undefined) profileUpdates.dateOfBirth = updateStudentDto.dateOfBirth;
    if (updateStudentDto.mustChangePassword !== undefined) profileUpdates.mustChangePassword = updateStudentDto.mustChangePassword;
    if (updateStudentDto.groupId !== undefined) {
      profileUpdates.groupId = updateStudentDto.groupId ? new Types.ObjectId(updateStudentDto.groupId) : null;
    }
    if (updateStudentDto.courseId !== undefined) {
      profileUpdates.courseId = updateStudentDto.courseId ? new Types.ObjectId(updateStudentDto.courseId) : null;
    }
    if (updateStudentDto.paymentStatus !== undefined) {
      profileUpdates.paymentStatus = updateStudentDto.paymentStatus;
      // When admin manually sets PAID, auto-create a Payment record using course price
      if (updateStudentDto.paymentStatus === PaymentStatus.PAID) {
        const studentProfile = await this.studentProfileModel.findOne({ userId: new Types.ObjectId(userId) }).populate('courseId').exec();
        const course = studentProfile?.courseId as any;
        const amount = course?.price || 500000;

        const existing = await this.paymentModel.findOne({
          studentId: new Types.ObjectId(userId),
        }).sort({ paymentDate: -1 }).exec();

        const now = new Date();
        const nextPay = new Date(now);
        nextPay.setMonth(nextPay.getMonth() + 1);

        // Only create if there's no recent payment in this month
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const hasThisMonth = existing && new Date(existing.paymentDate) >= thisMonthStart;
        if (!hasThisMonth) {
          const newPayment = new this.paymentModel({
            studentId: new Types.ObjectId(userId),
            amount,
            paymentDate: now,
            nextPaymentDate: nextPay,
            status: PaymentStatus.PAID,
            transactionId: 'manual-admin-set',
          });
          await newPayment.save();
        }
      }
    }
    // Handle custom next payment date: create/update billing record
    if (updateStudentDto.nextPaymentDate) {
      const nextPayDate = new Date(updateStudentDto.nextPaymentDate);
      const existingPayment = await this.paymentModel
        .findOne({ studentId: new Types.ObjectId(userId) })
        .sort({ paymentDate: -1 })
        .exec();

      if (existingPayment) {
        // Update the latest payment record's nextPaymentDate
        await this.paymentModel.findByIdAndUpdate(existingPayment._id, {
          nextPaymentDate: nextPayDate,
        }).exec();
      } else {
        // Create an initial payment tracking record
        const newPayment = new this.paymentModel({
          studentId: new Types.ObjectId(userId),
          amount: 0,
          paymentDate: new Date(),
          nextPaymentDate: nextPayDate,
          status: PaymentStatus.PAID,
        });
        await newPayment.save();
      }
    }

    if (updateStudentDto.xp !== undefined) {
      profileUpdates.xp = updateStudentDto.xp;
      // Recalculate level: 1 level per 1000 XP (level = floor(xp / 1000) + 1)
      profileUpdates.level = Math.floor(updateStudentDto.xp / 1000) + 1;
    }
    if (updateStudentDto.coins !== undefined) {
      profileUpdates.coins = updateStudentDto.coins;
    }

    let updatedProfile = null;
    if (Object.keys(profileUpdates).length > 0) {
      // If groupId is being changed, sync group rosters
      if (updateStudentDto.groupId !== undefined) {
        // Remove from all groups first
        await this.groupModel.updateMany(
          { students: new Types.ObjectId(userId) },
          { $pull: { students: new Types.ObjectId(userId) } }
        ).exec();
        // Add to new group if groupId is non-empty
        if (updateStudentDto.groupId) {
          await this.groupModel.findByIdAndUpdate(
            updateStudentDto.groupId,
            { $addToSet: { students: new Types.ObjectId(userId) } }
          ).exec();
        }
      }

      updatedProfile = await this.studentProfileModel
        .findOneAndUpdate({ userId: new Types.ObjectId(userId) }, profileUpdates, { new: true })
        .exec();
    } else {
      updatedProfile = await this.studentProfileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    }

    const updatedUser = await this.userModel.findById(userId).exec();

    // Notify bot on status changes (Block / Unblock)
    if (userExists && updatedUser && userExists.status !== updatedUser.status) {
      if (updatedUser.status === UserStatus.BLOCKED) {
        this.botService.notifyStudentBlocked(updatedUser).catch(() => {});
      } else if (updatedUser.status === UserStatus.ACTIVE && userExists.status === UserStatus.BLOCKED) {
        this.botService.notifyStudentUnblocked(updatedUser).catch(() => {});
      }
    }

    return {
      user: updatedUser,
      profile: updatedProfile,
    };
  }

  async deleteStudent(userId: string, requestingUser?: any): Promise<any> {
    const userExists = await this.userModel.findById(userId).exec();
    if (!userExists) {
      throw new NotFoundException('Student user not found');
    }

    if (requestingUser) {
      if (requestingUser.role === Role.BRANCH_ADMIN && (!userExists.branchId || userExists.branchId.toString() !== requestingUser.branchId)) {
        throw new ForbiddenException('You do not have access to this student');
      }
    }

    const deletedUser = await this.userModel.findByIdAndDelete(userId).exec();
    if (!deletedUser) {
      throw new NotFoundException('Student user not found');
    }

    // Notify bot
    this.botService.notifyStudentDeleted(deletedUser).catch(() => {});

    // Remove the student's ID from all groups' students arrays
    await this.groupModel.updateMany(
      { students: new Types.ObjectId(userId) },
      { $pull: { students: new Types.ObjectId(userId) } }
    ).exec();

    const profile = await this.studentProfileModel.findOneAndDelete({ userId: new Types.ObjectId(userId) }).exec();
    return { user: deletedUser, profile };
  }

  async getProfile(userId: string, requestingUser?: any): Promise<any> {
    const profile = await this.studentProfileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'userId',
        populate: {
          path: 'branchId',
          model: 'Branch'
        }
      })
      .populate('groupId')
      .populate('courseId')
      .exec();

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    const studentUser = profile.userId as any;
    if (requestingUser) {
      if (requestingUser.role === Role.BRANCH_ADMIN && (!studentUser || !studentUser.branchId || studentUser.branchId.toString() !== requestingUser.branchId)) {
        throw new ForbiddenException('You do not have access to this student');
      }
    }

    // Calculate ranking position dynamically
    const allProfiles = await this.studentProfileModel.find().sort({ xp: -1 }).exec();
    const rankIndex = allProfiles.findIndex((p) => p.userId.toString() === userId.toString());
    const rankingPosition = rankIndex !== -1 ? rankIndex + 1 : undefined;
    
    const profileObj = profile.toObject() as any;

    // Dynamic completed lessons and quiz score calculation
    let completedLessonsCount = 0;
    let totalLessonsCount = 0;
    let averageQuizScore = 0;

    if (profile.courseId) {
      const courseIdStr = profile.courseId._id ? profile.courseId._id.toString() : profile.courseId.toString();
      
      const moduleModel = this.studentProfileModel.db.model('CourseModule');
      const lessonModel = this.studentProfileModel.db.model('Lesson');
      const progressModel = this.studentProfileModel.db.model('LessonProgress');

      const modules = await moduleModel.find({ courseId: new Types.ObjectId(courseIdStr) }).exec();
      const moduleIds = modules.map((m) => m._id);

      const lessons = await lessonModel.find({ moduleId: { $in: moduleIds } }).exec();
      const lessonIds = lessons.map((l) => l._id);
      totalLessonsCount = lessons.length;

      if (lessonIds.length > 0) {
        const progressList = await progressModel.find({
          studentId: new Types.ObjectId(userId),
          lessonId: { $in: lessonIds },
          completed: true,
        }).exec();

        completedLessonsCount = progressList.length;
        
        const scoreSum = progressList.reduce((sum, p) => sum + (p.score || 0), 0);
        averageQuizScore = completedLessonsCount > 0 ? Math.round(scoreSum / completedLessonsCount) : 0;
      }
    }

    const attendanceModel = this.studentProfileModel.db.model('Attendance');
    const presentCount = await attendanceModel.countDocuments({ studentId: new Types.ObjectId(userId), status: 'PRESENT' }).exec();
    const absentCount = await attendanceModel.countDocuments({ studentId: new Types.ObjectId(userId), status: 'ABSENT' }).exec();
    
    const totalAttendance = presentCount + absentCount;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

    const dynamicStatus = await this.calculateStudentPaymentStatus(userId);

    (profileObj as any).rankingPosition = rankingPosition;
    (profileObj as any).completedLessonsCount = completedLessonsCount;
    (profileObj as any).totalLessonsCount = totalLessonsCount;
    (profileObj as any).averageQuizScore = averageQuizScore;
    (profileObj as any).presentCount = presentCount;
    (profileObj as any).absentCount = absentCount;
    (profileObj as any).attendancePercentage = attendancePercentage;
    (profileObj as any).paymentStatus = dynamicStatus;

    // Flatten User details for ease of rendering in frontend
    const user = profileObj.userId as any;
    if (user) {
      profileObj.fullName = user.fullName;
      profileObj.label = user.label || '';
      profileObj.email = user.email || '';
      profileObj.status = user.status;
      profileObj.avatar = user.avatar || '';
      profileObj.studentPhone = profileObj.studentPhone || user.studentPhone || user.phone || '';
      profileObj.branchName = user.branchId?.name || "Asosiy filial";
    }

    return profileObj;
  }

  async getLeaderboard(requestingUser?: any, type: 'all' | 'branch' | 'group' = 'all'): Promise<any[]> {
    let filter = {};

    if (requestingUser && requestingUser.role === Role.STUDENT) {
      const studentUser = await this.userModel.findById(requestingUser.userId).exec();
      const studentProfile = await this.studentProfileModel.findOne({ userId: new Types.ObjectId(requestingUser.userId) }).exec();

      if (type === 'branch' && studentUser?.branchId) {
        const branchUsers = await this.userModel.find({ branchId: studentUser.branchId }).select('_id').exec();
        const userIds = branchUsers.map(u => u._id);
        filter = { userId: { $in: userIds } };
      } else if (type === 'group' && studentProfile?.groupId) {
        filter = { groupId: studentProfile.groupId };
      }
    }

    const profiles = await this.studentProfileModel
      .find(filter)
      .populate('userId', 'fullName avatar email phone label')
      .sort({ xp: -1 })
      .limit(100)
      .exec();

    return profiles.map((profile, index) => {
      const pObj = profile.toObject();
      return {
        ...pObj,
        rankingPosition: index + 1,
      };
    });
  }

  async addXpAndCoins(userId: string | Types.ObjectId, xpToAdd: number, coinsToAdd: number): Promise<StudentProfileDocument> {
    const profile = await this.studentProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    profile.xp = Math.max(0, profile.xp + xpToAdd);
    profile.coins = Math.max(0, profile.coins + coinsToAdd);
    profile.level = Math.floor(profile.xp / 1000) + 1;

    return profile.save();
  }

  async updateHomeworkProgress(userId: string | Types.ObjectId, progress: number): Promise<StudentProfileDocument> {
    const profile = await this.studentProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }
    profile.homeworkProgress = progress;
    return profile.save();
  }

  async updateOwnAvatar(userId: string, avatarUrl: string): Promise<any> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { success: true, avatar: user.avatar };
  }

  async updateOwnProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; dateOfBirth?: string },
  ): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    const userUpdates: any = {};
    const profileUpdates: any = {};

    // Build fullName from firstName + lastName
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const currentParts = (user.fullName || '').split(' ');
      const currentFirst = currentParts[0] || '';
      const currentLast = currentParts.slice(1).join(' ') || '';
      const newFirst = data.firstName !== undefined ? data.firstName.trim() : currentFirst;
      const newLast = data.lastName !== undefined ? data.lastName.trim() : currentLast;
      userUpdates.fullName = `${newFirst} ${newLast}`.trim();
    }

    if (data.dateOfBirth !== undefined) {
      userUpdates.dateOfBirth = data.dateOfBirth;
      profileUpdates.dateOfBirth = data.dateOfBirth;
    }

    if (Object.keys(userUpdates).length > 0) {
      await this.userModel.findByIdAndUpdate(userId, userUpdates).exec();
    }
    if (Object.keys(profileUpdates).length > 0) {
      await this.studentProfileModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        profileUpdates,
      ).exec();
    }

    const updatedUser = await this.userModel.findById(userId).exec();
    return { success: true, fullName: updatedUser?.fullName, dateOfBirth: data.dateOfBirth };
  }

  async getContract(studentId: string): Promise<any> {
    return this.contractModel.findOne({ studentId: new Types.ObjectId(studentId) }).exec();
  }

  async generateContract(studentId: string, dto: GenerateContractDto): Promise<any> {
    const studentUser = await this.userModel.findById(studentId).exec();
    if (!studentUser) {
      throw new NotFoundException('Student user not found');
    }

    const profile = await this.studentProfileModel
      .findOne({ userId: new Types.ObjectId(studentId) })
      .populate('groupId')
      .populate('courseId')
      .exec();

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    const course = profile.courseId as any;
    const group = profile.groupId as any;

    const courseName = course?.title || 'Noma\'lum Kurs';
    const groupName = group?.name || 'Noma\'lum Guruh';
    const monthlyPayment = dto.monthlyPayment !== undefined ? dto.monthlyPayment : (course?.price || 500000);

    // Calculate age to see if they're under 18
    const dateOfBirth = studentUser.dateOfBirth || profile.dateOfBirth || '';
    const age = this.calculateAge(dateOfBirth);
    const isUnder18 = age < 18;

    let contract = await this.contractModel.findOne({ studentId: new Types.ObjectId(studentId) }).exec();
    let contractNumber = contract?.contractNumber;

    if (!contractNumber) {
      const year = new Date().getFullYear();
      const count = await this.contractModel.countDocuments({ contractNumber: new RegExp(`CN-${year}-`) }).exec();
      const nextNum = String(count + 1).padStart(6, '0');
      contractNumber = `CN-${year}-${nextNum}`;
    }

    const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');
    const contractsDir = path.join(uploadsDir, 'contracts');
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }

    const filename = `${contractNumber}.pdf`;
    const filePath = path.join(contractsDir, filename);
    const pdfUrl = `/uploads/contracts/${filename}`;

    const contractDate = dto.contractDate ? new Date(dto.contractDate) : new Date();

    const pdfData = {
      contractNumber,
      contractDate,
      fullName: studentUser.fullName,
      phone: studentUser.phone || studentUser.studentPhone || '',
      address: dto.address || '',
      passportOrJshshir: dto.passportOrJshshir || '',
      isUnder18,
      parentName: dto.parentName || studentUser.parentPhone || '',
      parentPhone: dto.parentPhone || '',
      courseName,
      groupName,
      monthlyPayment,
    };

    // Generate the PDF
    await this.generatePdfFile(filePath, pdfData);

    const contractData = {
      studentId: new Types.ObjectId(studentId),
      contractNumber,
      status: 'GENERATED',
      generatedDate: new Date(),
      fullName: studentUser.fullName,
      phone: studentUser.phone || studentUser.studentPhone || '',
      address: dto.address,
      passportOrJshshir: dto.passportOrJshshir,
      parentName: dto.parentName,
      parentPhone: dto.parentPhone,
      courseName,
      groupName,
      monthlyPayment,
      contractDate,
      pdfUrl,
    };

    if (contract) {
      // Update existing
      contract = await this.contractModel.findByIdAndUpdate(contract._id, contractData, { new: true }).exec();
    } else {
      // Create new
      contract = new this.contractModel(contractData);
      await contract.save();
    }

    return contract;
  }

  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 18;
    let birthDate: Date;
    if (dateOfBirth.includes('.')) {
      const parts = dateOfBirth.split('.');
      birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      birthDate = new Date(dateOfBirth);
    }
    
    if (isNaN(birthDate.getTime())) return 18;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }


  private generatePdfFile(filePath: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Register Arial or standard system font if available, to support Uzbek characters
        const regularPaths = [
          'C:\\Windows\\Fonts\\arial.ttf',
          'C:\\Windows\\Fonts\\segoeui.ttf',
          '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
          '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        ];
        const boldPaths = [
          'C:\\Windows\\Fonts\\arialbd.ttf',
          'C:\\Windows\\Fonts\\segoeuib.ttf',
          '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
          '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        ];

        let regularFont = 'Helvetica';
        let boldFont = 'Helvetica-Bold';

        for (const p of regularPaths) {
          if (fs.existsSync(p)) {
            regularFont = p;
            break;
          }
        }
        for (const p of boldPaths) {
          if (fs.existsSync(p)) {
            boldFont = p;
            break;
          }
        }

        doc.font(regularFont);

        // PAGE 1: Professional legal header
        doc.fillColor('#000000');
        doc.font(boldFont).fontSize(12).text('O\'QUV XIZMATLARINI KO\'RSATISH BO\'YICHA', 40, 50, { align: 'center' });
        doc.font(boldFont).fontSize(14).text(`SHARTNOMA № ${data.contractNumber}`, 40, 68, { align: 'center' });
        
        doc.moveDown(1.5);
        const headerY = doc.y;
        doc.font(regularFont).fontSize(10).text('Toshkent shahri', 40, headerY);
        doc.font(regularFont).fontSize(10).text(new Date(data.contractDate).toLocaleDateString('uz-UZ'), 40, headerY, { align: 'right' });
        
        doc.moveDown(1.5);
        doc.font(regularFont).fontSize(9.5).text(
          `INFAST26 XK (bundan buyon matnda "Tashkilot" deb yuritiladi), o'z Ustavi asosida ish yurituvchi rahbari nomidan bir tomondan, va voyaga yetgan jismoniy shaxs (yoki voyaga yetmagan jismoniy shaxsning qonuniy vakili) ${data.fullName} (bundan buyon matnda "Mijoz" deb yuritiladi) ikkinchi tomondan, birgalikda "Tomonlar" deb ataluvchilar, quyidagilar to'g'risida ushbu shartnomani imzoladilar:`,
          40,
          doc.y,
          { align: 'justify', lineGap: 3, width: 515 }
        );

        doc.moveDown(1.5);

        // Clause 1: Shartnoma Predmeti
        doc.font(boldFont).fontSize(10).text('1. SHARTNOMA PREDMETI', 40, doc.y, { lineGap: 3 });
        doc.font(regularFont).fontSize(9.5);
        doc.text(
          `1.1. Mazkur shartnoma shartlariga muvofiq, Tashkilot Mijozga shartnomada belgilangan o'quv kursi doirasida ta'lim xizmatlarini ko'rsatish, Mijoz esa o'z navbatida belgilangan to'lovlarni o'z vaqtida to'lash va o'quv tartib-qoidalariga rioya qilish majburiyatini oladi.`,
          40,
          doc.y + 4,
          { align: 'justify', lineGap: 2, width: 515 }
        );
        doc.text(`1.2. O'quv kursi nomi: ${data.courseName}`, 40, doc.y + 4, { width: 515 });
        doc.text(`1.3. O'quv guruhi: ${data.groupName}`, 40, doc.y + 4, { width: 515 });
        doc.text(`1.4. Oylik to'lov summasi: ${data.monthlyPayment.toLocaleString('uz-UZ')} UZS.`, 40, doc.y + 4, { width: 515 });

        doc.moveDown(1.5);

        // Clause 2: Tomonlarning huquq va majburiyatlari
        doc.font(boldFont).fontSize(10).text('2. TOMONLARNING HUQUQ VA MAJBURIYATLARI', 40, doc.y, { lineGap: 3 });
        
        doc.font(boldFont).fontSize(9.5).text('2.1. Tashkilotning majburiyatlari:', 40, doc.y + 4);
        doc.font(regularFont);
        doc.text('2.1.1. Mashg\'ulotlarni tasdiqlangan o\'quv dasturiga muvofiq yuqori saviyada tashkil etish.', 50, doc.y + 3, { width: 505 });
        doc.text('2.1.2. Mijoz uchun xavfsiz va shinam dars xonalari hamda LMS platformasidan foydalanish imkoniyatini taqdim etish.', 50, doc.y + 3, { width: 505 });
        doc.text('2.1.3. O\'quv dasturi muvaffaqiyatli yakunlanganda Mijozga sertifikat taqdim etish.', 50, doc.y + 3, { width: 505 });

        doc.font(boldFont).text('2.2. Tashkilotning huquqlari:', 40, doc.y + 6);
        doc.font(regularFont);
        doc.text('2.2.1. To\'lovlar muddati kechiktirilganda Mijozni darslardan va platformadan chetlashtirish.', 50, doc.y + 3, { width: 505 });
        doc.text('2.2.2. Mijoz o\'quv markazining ichki tartib-qoidalarini buzgan taqdirda, shartnomani bir tomonlama bekor qilish.', 50, doc.y + 3, { width: 505 });

        doc.font(boldFont).text('2.3. Mijozning majburiyatlari:', 40, doc.y + 6);
        doc.font(regularFont);
        doc.text('2.3.1. Mashg\'ulotlarda muntazam qatnashish, kechikmaslik va o\'quv vazifalarini o\'z vaqtida bajarish.', 50, doc.y + 3, { width: 505 });
        doc.text(`2.3.2. Har oy boshlanishidan kamida 5 kun oldin ${data.monthlyPayment.toLocaleString('uz-UZ')} UZS miqdoridagi to\'lovni to\'liq to'lash.`, 50, doc.y + 3, { width: 505 });
        doc.text('2.3.3. O\'quv markazi jihozlarini asrash, zarar yetkazilganda uni to\'liq qoplab berish.', 50, doc.y + 3, { width: 505 });

        doc.font(boldFont).text('2.4. Mijozning huquqlari:', 40, doc.y + 6);
        doc.font(regularFont);
        doc.text('2.4.1. Tashkilotdan shartnomaga muvofiq sifatli ta\'lim va sharoitlarni talab qilish.', 50, doc.y + 3, { width: 505 });

        // Footer of Page 1
        doc.fontSize(8).fillColor('#9ca3af').text('InFast Academy OS • Rasmiy Shartnoma • Sahifa 1 / 2', 40, 790, { align: 'center' });

        // PAGE 2
        doc.addPage();
        doc.fillColor('#000000');
        
        // Clause 3: To'lov tartibi
        doc.font(boldFont).fontSize(10).text('3. TO\'LOV TARTIBI VA HISOB-KITOBLAR', 40, 50, { lineGap: 3 });
        doc.font(regularFont).fontSize(9.5);
        doc.text(`3.1. O'quv kursi uchun to'lov miqdori har bir kalendar oyi uchun ${data.monthlyPayment.toLocaleString('uz-UZ')} UZS qilib belgilanadi.`, 40, doc.y + 4, { align: 'justify', lineGap: 2, width: 515 });
        doc.text('3.2. Mijoz oylik to\'lovni keyingi o\'quv oyi boshlanishidan kamida 5 (besh) ish kuni oldin amalga oshirishi shart.', 40, doc.y + 4, { align: 'justify', lineGap: 2, width: 515 });
        doc.text('3.3. Kursdan voz kechilganda, o\'sha oy uchun amalga oshirilgan to\'lov qaytarilmaydi hamda keyingi oylarga o\'tkazilmaydi.', 40, doc.y + 4, { align: 'justify', lineGap: 2, width: 515 });

        doc.moveDown(1.5);

        // Clause 4: Fors-major va Nizolarni hal etish
        doc.font(boldFont).fontSize(10).text('4. TOMONLARNING JAVOBGARLIGI VA NIZOLARNI HAL ETISH', 40, doc.y, { lineGap: 3 });
        doc.font(regularFont).fontSize(9.5);
        doc.text('4.1. Shartnoma yuzasidan kelib chiqadigan nizolar va kelishmovchiliklar Tomonlar o\'rtasida muzokaralar o\'tkazish yo\'li bilan hal etiladi.', 40, doc.y + 4, { align: 'justify', lineGap: 2, width: 515 });
        doc.text('4.2. Muzokaralar yo\'li bilan kelishuvga erishilmagan taqdirda, nizolar O\'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq sud tartibida ko\'rib chiqiladi.', 40, doc.y + 4, { align: 'justify', lineGap: 2, width: 515 });
        doc.text('4.3. Tomonlar yengib bo\'lmas kuch (fors-major) holatlari tufayli majburiyatlarni bajara olmaganlik uchun javobgarlikdan ozod etiladilar.', 40, doc.y + 4, { align: 'justify', lineGap: 2, width: 515 });

        doc.moveDown(1.5);

        // Clause 5: Shartnomaning amal qilish muddati
        doc.font(boldFont).fontSize(10).text('5. SHARTNOMANING AMAL QILISH MUDDATI', 40, doc.y, { lineGap: 3 });
        doc.font(regularFont).fontSize(9.5);
        doc.text('5.1. Mazkur shartnoma Tomonlar tomonidan imzolangan kundan boshlab kuchga kiradi va o\'quv kursi to\'liq yakunlangunga qadar amal qiladi.', 40, doc.y + 4, { align: 'justify', lineGap: 2, width: 515 });

        doc.moveDown(2);

        // Clause 6: Tomonlarning rekvizitlari va imzolari
        doc.font(boldFont).fontSize(10).text('6. TOMONLARNING REKVIZITLARI VA IMZOLARI', 40, doc.y, { lineGap: 3 });
        
        const signY = doc.y + 15;

        // Tashkilot rekvizitlari
        doc.font(boldFont).fontSize(9.5).text('TASHKILOT:', 40, signY);
        doc.font(regularFont).fontSize(9);
        doc.text('INFAST26 XK', 40, doc.y + 5, { width: 230 });
        doc.text('INN: 312 956 346', 40, doc.y + 3, { width: 230 });
        doc.text('Manzil: Toshkent sh., Chilonzor tumani', 40, doc.y + 3, { width: 230 });
        doc.text('Telefon: +998 90 271 00 27', 40, doc.y + 3, { width: 230 });
        doc.text('Rahbar: ________________________', 40, doc.y + 15, { width: 230 });

        // Mijoz rekvizitlari
        doc.font(boldFont).fontSize(9.5).text('MIJOZ:', 300, signY);
        doc.font(regularFont).fontSize(9);
        doc.text(`F.I.SH.: ${data.fullName}`, 300, doc.y + 5, { width: 230 });
        doc.text(`Pasport / JSHSHIR: ${data.passportOrJshshir || '___________________'}`, 300, doc.y + 3, { width: 230 });
        doc.text(`Manzil: ${data.address || '___________________'}`, 300, doc.y + 3, { width: 230 });
        doc.text(`Telefon: ${data.phone}`, 300, doc.y + 3, { width: 230 });
        doc.text('Imzo: ________________________', 300, doc.y + 15, { width: 230 });

        if (data.isUnder18) {
          // Parent Signature Box
          doc.moveDown(2);
          const parentY = doc.y;
          doc.font(boldFont).fontSize(9.5).text('OTA-ONA / QONUNIY VAKIY NOMIDAN:', 40, parentY);
          doc.font(regularFont).fontSize(9);
          doc.text(`F.I.SH.: ${data.parentName || '_________________________' }`, 40, doc.y + 5, { width: 515 });
          doc.text(`Telefon: ${data.parentPhone || '_________________________' }`, 40, doc.y + 3, { width: 515 });
          doc.text('Imzo: ________________________', 40, doc.y + 10, { width: 515 });
        }

        // Footer of Page 2
        doc.fontSize(8).fillColor('#9ca3af').text('InFast Academy OS • Rasmiy Shartnoma • Sahifa 2 / 2', 40, 790, { align: 'center' });

        doc.end();

        writeStream.on('finish', () => {
          resolve();
        });
        writeStream.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
