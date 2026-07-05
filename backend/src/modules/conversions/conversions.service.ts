import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LeadsService } from '../leads/leads.service';
import { ActivitiesService } from '../activities/activities.service';
import { Role } from '../../common/enums/roles.enum';
import { UserStatus, PaymentStatus } from '../../common/enums/status.enum';

// Schemas
import { User, UserDocument } from '../users/schemas/user.schema';
import { StudentProfile, StudentProfileDocument } from '../students/schemas/student-profile.schema';
import { Group, GroupDocument } from '../groups/schemas/group.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Lesson, LessonDocument } from '../lms/schemas/lesson.schema';
import { LessonProgress, LessonProgressDocument } from '../lms/schemas/lesson-progress.schema';
import { Lead, LeadDocument } from '../leads/schemas/lead.schema';

@Injectable()
export class ConversionsService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Lesson.name) private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(LessonProgress.name) private readonly progressModel: Model<LessonProgressDocument>,
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
    private readonly leadsService: LeadsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async convertLeadToStudent(
    leadId: string,
    courseId: string,
    groupId: string,
    amount: number,
    nextPaymentDate: string,
    userId: string, // current admin user performing conversion
    ip?: string,
  ): Promise<any> {
    try {
      // First attempt: Try with transaction session enabled
      return await this.executeConversion(leadId, courseId, groupId, amount, nextPaymentDate, userId, ip, true);
    } catch (error: any) {
      // If standalone MongoDB instance is detected at runtime via the driver exception
      if (error?.message?.includes('replica set member') || error?.code === 20) {
        // Self-heal: retry immediately in standard non-transactional mode
        return await this.executeConversion(leadId, courseId, groupId, amount, nextPaymentDate, userId, ip, false);
      }
      throw error;
    }
  }

  private async executeConversion(
    leadId: string,
    courseId: string,
    groupId: string,
    amount: number,
    nextPaymentDate: string,
    userId: string,
    ip: string | undefined,
    useTransaction: boolean,
  ): Promise<any> {
    const lead = await this.leadsService.findOne(leadId);
    if (!lead) throw new NotFoundException('Lead topilmadi');
    if (lead.status === 'CONVERTED') {
      throw new BadRequestException('Ushbu lead allaqachon talabaga aylantirilgan');
    }

    let session: any = null;
    if (useTransaction) {
      try {
        session = await this.connection.startSession();
        session.startTransaction();
      } catch (e) {
        useTransaction = false;
        session = null;
      }
    }

    const sessionToUse = useTransaction && session ? session : undefined;
    const saveOptions = sessionToUse ? { session: sessionToUse } : undefined;

    try {
      // 1. Double check duplicate user phone
      const existingUser = await this.userModel.findOne({ phone: lead.phone }).session(sessionToUse).exec();
      if (existingUser) {
        throw new ConflictException('Ushbu telefon raqamga ega o\'quvchi tizimda allaqachon mavjud');
      }

      // 2. Verify Group
      const group = await this.groupModel.findById(groupId).session(sessionToUse).exec();
      if (!group) throw new NotFoundException('Guruh topilmadi');

      // 3. Generate default password (e.g. dateOfBirth DDMMYYYY, or fallback)
      const plainPassword = lead.birthDate ? lead.birthDate.replace(/\./g, '') : '12345678';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // 4. Create User
      const newStudentUser = new this.userModel({
        fullName: `${lead.firstName} ${lead.lastName}`,
        phone: lead.phone,
        studentPhone: lead.phone,
        parentPhone: lead.parentPhone,
        dateOfBirth: lead.birthDate,
        email: lead.phone + '@infast.uz', // fallback unique email
        password: hashedPassword,
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,
        mustChangePassword: true,
      });
      const savedUser = await newStudentUser.save(saveOptions);

      // 5. Create StudentProfile (XP=0, Coins=0, Level=1 by schema default)
      const studentProfile = new this.studentProfileModel({
        userId: savedUser._id,
        studentPhone: lead.phone,
        parentPhone: lead.parentPhone,
        dateOfBirth: lead.birthDate,
        groupId: new Types.ObjectId(groupId),
        courseId: new Types.ObjectId(courseId),
        paymentStatus: amount > 0 ? PaymentStatus.PAID : PaymentStatus.UNPAID,
      });
      await studentProfile.save(saveOptions);

      // 6. Enroll in Group (push user ID to group students array)
      group.students.push(savedUser._id);
      await group.save(saveOptions);

      // 7. Create Payment Track
      const nextPay = nextPaymentDate ? new Date(nextPaymentDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const payment = new this.paymentModel({
        studentId: savedUser._id,
        amount: amount,
        paymentDate: new Date(),
        nextPaymentDate: nextPay,
        status: amount > 0 ? PaymentStatus.PAID : PaymentStatus.UNPAID,
        notes: 'Lead dan aylantirish orqali birlamchi to\'lov',
      });
      await payment.save(saveOptions);

      // 8. Initialize LMS Progress
      const lessons = await this.lessonModel.find({ courseId: new Types.ObjectId(courseId) }).session(sessionToUse).exec();
      const progressDocs = lessons.map((lesson) => ({
        studentId: savedUser._id,
        lessonId: lesson._id,
        completed: false,
        practiceCompleted: false,
        testCompleted: false,
        score: 0,
      }));
      if (progressDocs.length > 0) {
        if (sessionToUse) {
          await this.progressModel.insertMany(progressDocs, { session: sessionToUse });
        } else {
          await this.progressModel.insertMany(progressDocs);
        }
      }

      // 9. Update Lead Document status
      await this.leadModel.findByIdAndUpdate(leadId, {
        $set: {
          status: 'CONVERTED',
          convertedAt: new Date(),
          lastActivityAt: new Date(),
        }
      }).session(sessionToUse).exec();

      // 10. Log Activity
      await this.activitiesService.log(
        userId,
        leadId,
        'CONVERTED_TO_STUDENT',
        'Lead',
        lead.status,
        `Lead faol Talabaga aylantirildi. Guruh: "${group.name}". Login: ${lead.phone}`,
        ip
      );

      if (useTransaction && session) {
        await session.commitTransaction();
        session.endSession();
      }

      return {
        success: true,
        userId: savedUser._id,
        phone: lead.phone,
        password: plainPassword,
        groupName: group.name,
      };

    } catch (error) {
      if (useTransaction && session) {
        try {
          await session.abortTransaction();
        } catch (e) {
          // ignore abort errors
        }
        try {
          session.endSession();
        } catch (e) {
          // ignore end session errors
        }
      }
      throw error;
    }
  }
}
