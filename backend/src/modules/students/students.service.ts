import { Injectable, NotFoundException, ConflictException, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
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
import * as bcrypt from 'bcrypt';

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
    private readonly paymentModel: Model<PaymentDocument>
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


  async findAll(): Promise<any[]> {
    const profiles = await this.studentProfileModel
      .find()
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


  async createStudent(createStudentDto: CreateStudentDto): Promise<any> {
    const { email, studentPhone, parentPhone, dateOfBirth, fullName, avatar, groupId, courseId, password } = createStudentDto;

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

    return {
      user: savedUser,
      profile: savedProfile,
      generatedPassword: defaultPassword,
    };
  }

  async updateStudent(userId: string, updateStudentDto: UpdateStudentDto): Promise<any> {
    const userExists = await this.userModel.findById(userId);
    if (!userExists) {
      throw new NotFoundException('Student user not found');
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

    return {
      user: updatedUser,
      profile: updatedProfile,
    };
  }

  async deleteStudent(userId: string): Promise<any> {
    const user = await this.userModel.findByIdAndDelete(userId).exec();
    if (!user) {
      throw new NotFoundException('Student user not found');
    }

    // Remove the student's ID from all groups' students arrays
    await this.groupModel.updateMany(
      { students: new Types.ObjectId(userId) },
      { $pull: { students: new Types.ObjectId(userId) } }
    ).exec();

    const profile = await this.studentProfileModel.findOneAndDelete({ userId: new Types.ObjectId(userId) }).exec();
    return { user, profile };
  }

  async getProfile(userId: string): Promise<any> {
    const profile = await this.studentProfileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId')
      .populate('groupId')
      .populate('courseId')
      .exec();

    if (!profile) {
      throw new NotFoundException('Student profile not found');
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
      profileObj.email = user.email || '';
      profileObj.status = user.status;
      profileObj.avatar = user.avatar || '';
      profileObj.studentPhone = profileObj.studentPhone || user.studentPhone || user.phone || '';
    }

    return profileObj;
  }

  async getLeaderboard(): Promise<any[]> {
    const profiles = await this.studentProfileModel
      .find()
      .populate('userId', 'fullName avatar email phone')
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
}
