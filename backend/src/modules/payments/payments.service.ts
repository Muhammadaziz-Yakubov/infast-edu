import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { StudentProfile, StudentProfileDocument } from '../students/schemas/student-profile.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Notification, NotificationDocument } from '../notifications/schemas/notification.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, UserStatus, NotificationType } from '../../common/enums/status.enum';

@Injectable()
export class PaymentsService implements OnModuleInit {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>
  ) { }

  onModuleInit() {
    // Run status checker immediately on start, then every 12 hours
    this.checkPaymentStatuses();
    setInterval(() => {
      this.checkPaymentStatuses();
    }, 12 * 60 * 60 * 1000);
  }

  async createPayment(dto: CreatePaymentDto): Promise<PaymentDocument> {
    const student = await this.userModel.findById(dto.studentId);
    if (!student) {
      throw new NotFoundException('Student user not found');
    }

    const paymentDate = new Date();
    // Add exactly 1 month to calculate nextPaymentDate
    const nextPaymentDate = new Date(paymentDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    const payment = new this.paymentModel({
      studentId: new Types.ObjectId(dto.studentId),
      amount: dto.amount,
      paymentDate,
      nextPaymentDate,
      status: PaymentStatus.PAID,
      transactionId: dto.transactionId,
    });
    const savedPayment = await payment.save();

    // 1. Update Student Profile status to PAID
    await this.studentProfileModel.findOneAndUpdate(
      { userId: new Types.ObjectId(dto.studentId) },
      { paymentStatus: PaymentStatus.PAID }
    ).exec();

    // 2. Automatically reactivate user if blocked
    await this.userModel.findByIdAndUpdate(dto.studentId, {
      status: UserStatus.ACTIVE,
    }).exec();

    // 3. Generate success notification
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(dto.studentId),
      title: "To'lov qabul qilindi",
      message: `Rahmat! ${dto.amount.toLocaleString()} so'm miqdoridagi to'lovingiz muvaffaqiyatli qabul qilindi. Hisobingiz faollashtirildi.`,
      type: NotificationType.PAYMENT_REMINDER,
    });
    await notification.save();

    return savedPayment;
  }

  async getStudentPayments(studentId: string): Promise<any[]> {
    const payments = await this.paymentModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .sort({ paymentDate: -1 })
      .exec();

    const MONTHS_UZ = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];

    return payments.map((p) => {
      const pObj = p.toObject();
      const pd = pObj.paymentDate ? new Date(pObj.paymentDate) : new Date();
      const npd = pObj.nextPaymentDate ? new Date(pObj.nextPaymentDate) : new Date();
      return {
        _id: pObj._id,
        studentId: pObj.studentId,
        amount: pObj.amount,
        paymentDate: pd.toISOString().split('T')[0],
        nextPaymentDate: npd.toISOString().split('T')[0],
        nextPaymentDateFormatted: `${String(npd.getDate()).padStart(2, '0')}.${String(npd.getMonth() + 1).padStart(2, '0')}.${npd.getFullYear()}`,
        status: pObj.status,
        transactionId: pObj.transactionId || '',
        month: MONTHS_UZ[pd.getMonth()],
        year: pd.getFullYear(),
      };
    });
  }

  async getStudentPaymentSummary(userId: string): Promise<any> {
    const MONTHS_UZ = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];

    // 1. Find student profile
    const profile = await this.studentProfileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!profile) throw new NotFoundException('Student profile not found');

    // 2. Find latest payment record
    const latestPayment = await this.paymentModel
      .findOne({ studentId: new Types.ObjectId(userId) })
      .sort({ paymentDate: -1 })
      .exec();

    // 3. All payment history
    const allPayments = await this.paymentModel
      .find({ studentId: new Types.ObjectId(userId) })
      .sort({ paymentDate: -1 })
      .exec();

    const now = new Date();

    // 4. Dynamically compute status and nextPaymentDate from real payments
    let dynamicStatus = 'UNPAID';
    let nextPaymentDate: Date | null = null;
    let nextPaymentDateFormatted = "To'lov qilinmagan";

    if (latestPayment?.nextPaymentDate) {
      nextPaymentDate = new Date(latestPayment.nextPaymentDate);
      nextPaymentDateFormatted = `${String(nextPaymentDate.getDate()).padStart(2, '0')}.${String(nextPaymentDate.getMonth() + 1).padStart(2, '0')}.${nextPaymentDate.getFullYear()}`;

      const fiveDaysBefore = new Date(nextPaymentDate);
      fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);

      if (now >= nextPaymentDate) {
        dynamicStatus = 'OVERDUE';
      } else if (now >= fiveDaysBefore && now < nextPaymentDate) {
        dynamicStatus = 'UPCOMING';
      } else {
        dynamicStatus = 'PAID';
      }
    }

    return {
      paymentStatus: dynamicStatus,
      nextPaymentDate: nextPaymentDate ? nextPaymentDate.toISOString().split('T')[0] : null,
      nextPaymentDateFormatted,
      latestPayment: latestPayment ? {
        _id: latestPayment._id,
        amount: latestPayment.amount,
        paymentDate: latestPayment.paymentDate?.toISOString().split('T')[0] || '',
        status: latestPayment.status,
        month: MONTHS_UZ[new Date(latestPayment.paymentDate).getMonth()],
        year: new Date(latestPayment.paymentDate).getFullYear(),
      } : null,
      history: allPayments.map((p) => {
        const pd = new Date(p.paymentDate);
        const npd = new Date(p.nextPaymentDate);
        return {
          _id: p._id,
          amount: p.amount,
          paymentDate: pd.toISOString().split('T')[0],
          nextPaymentDate: npd.toISOString().split('T')[0],
          nextPaymentDateFormatted: `${String(npd.getDate()).padStart(2, '0')}.${String(npd.getMonth() + 1).padStart(2, '0')}.${npd.getFullYear()}`,
          status: p.status,
          transactionId: p.transactionId || '',
          month: MONTHS_UZ[pd.getMonth()],
          year: pd.getFullYear(),
        };
      }),
    };
  }

  async getStudentPaymentsFormatted(studentId: string): Promise<any[]> {
    const payments = await this.paymentModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .sort({ paymentDate: -1 })
      .exec();

    return payments.map((p) => {
      const pObj = p.toObject();
      return {
        _id: pObj._id,
        studentId: pObj.studentId,
        amount: pObj.amount,
        paymentDate: pObj.paymentDate ? new Date(pObj.paymentDate).toISOString().split('T')[0] : '',
        nextPaymentDate: pObj.nextPaymentDate ? new Date(pObj.nextPaymentDate).toISOString().split('T')[0] : '',
        status: pObj.status,
        transactionId: pObj.transactionId || '',
      };
    });
  }

  async getAllPayments(): Promise<any[]> {
    const payments = await this.paymentModel
      .find()
      .populate('studentId')
      .sort({ paymentDate: -1 })
      .exec();

    return payments.map((p) => {
      const pObj = p.toObject();
      const student = pObj.studentId as any;
      return {
        _id: pObj._id,
        studentId: student?._id || pObj.studentId,
        studentName: student?.fullName || 'Noma\'lum Talaba',
        studentPhone: student?.studentPhone || student?.phone || '',
        amount: pObj.amount,
        paymentDate: pObj.paymentDate ? new Date(pObj.paymentDate).toISOString().split('T')[0] : '',
        nextPaymentDate: pObj.nextPaymentDate ? new Date(pObj.nextPaymentDate).toISOString().split('T')[0] : '',
        status: pObj.status,
        transactionId: pObj.transactionId || '',
      };
    });
  }

  // Automatic Background Payment Checker
  async checkPaymentStatuses(): Promise<void> {
    const now = new Date();
    const profiles = await this.studentProfileModel.find().exec();

    for (const profile of profiles) {
      const studentId = profile.userId;

      // Find the latest payment record
      const latestPayment = await this.paymentModel
        .findOne({ studentId })
        .sort({ nextPaymentDate: -1 })
        .exec();

      if (!latestPayment) {
        continue;
      }

      const nextPay = new Date(latestPayment.nextPaymentDate);

      // Calculate 5 days before payment date
      const fiveDaysBefore = new Date(nextPay);
      fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);

      let targetPaymentStatus: PaymentStatus = latestPayment.status;

      if (now >= nextPay) {
        // OVERDUE status
        targetPaymentStatus = PaymentStatus.OVERDUE;
      } else if (now >= fiveDaysBefore && now < nextPay) {
        // UPCOMING status
        targetPaymentStatus = PaymentStatus.UPCOMING;
      } else {
        // PAID status
        targetPaymentStatus = PaymentStatus.PAID;
      }

      // 1. Sync Payment record if changed
      if (latestPayment.status !== targetPaymentStatus) {
        latestPayment.status = targetPaymentStatus;
        await latestPayment.save();
      }

      // 2. Sync Student Profile status if changed
      if (profile.paymentStatus !== targetPaymentStatus) {
        profile.paymentStatus = targetPaymentStatus;
        await profile.save();

        // 3. Block student if payment is OVERDUE
        if (targetPaymentStatus === PaymentStatus.OVERDUE) {
          await this.userModel.findByIdAndUpdate(studentId, { status: UserStatus.BLOCKED }).exec();

          // Create notification for blocking
          const alert = new this.notificationModel({
            userId: studentId,
            title: "Hisob bloklandi",
            message: "Oylik to'lov muddati o'tib ketdi. Hisobingiz avtomatik ravishda bloklandi. To'lovni amalga oshirib, hisobingizni faollashtiring.",
            type: NotificationType.PAYMENT_REMINDER,
          });
          await alert.save();
        }

        // 4. Warn student if payment is UPCOMING
        if (targetPaymentStatus === PaymentStatus.UPCOMING) {
          const daysLeft = Math.ceil((nextPay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const alert = new this.notificationModel({
            userId: studentId,
            title: "To'lov eslatmasi",
            message: `Oylik to'lov muddati ${daysLeft} kun ichida tugaydi (${nextPay.toLocaleDateString('uz-UZ')}). Iltimos, vaqtida to'lov qiling.`,
            type: NotificationType.PAYMENT_REMINDER,
          });
          await alert.save();
        }
      }
    }
  }

  async getOverdueStudents(): Promise<any[]> {
    const overduePayments = await this.paymentModel
      .find({ status: PaymentStatus.OVERDUE })
      .populate('studentId')
      .sort({ nextPaymentDate: 1 })
      .exec();

    return overduePayments.map((p) => {
      const pObj = p.toObject();
      const student = pObj.studentId as any;
      return {
        _id: pObj._id,
        studentId: student?._id || pObj.studentId,
        studentName: student?.fullName || "Noma'lum Talaba",
        studentPhone: student?.studentPhone || student?.phone || '',
        amount: pObj.amount,
        nextPaymentDate: pObj.nextPaymentDate ? new Date(pObj.nextPaymentDate).toISOString().split('T')[0] : '',
        status: pObj.status,
      };
    });
  }
}
