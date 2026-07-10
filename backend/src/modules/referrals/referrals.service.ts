import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Referral, ReferralDocument } from './schemas/referral.schema';
import { StudentsService } from '../students/students.service';
import { StudentProfile, StudentProfileDocument } from '../students/schemas/student-profile.schema';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(Referral.name)
    private readonly referralModel: Model<ReferralDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    private readonly studentsService: StudentsService,
  ) {}

  /** Student do'stini taklif qiladi */
  async create(dto: { referrerId: string; friendName: string; friendPhone: string }): Promise<ReferralDocument> {
    // Prevent duplicate referrals by same phone
    const existing = await this.referralModel.findOne({
      friendPhone: dto.friendPhone,
      status: { $ne: 'REJECTED' },
    });
    if (existing) {
      throw new BadRequestException('Bu telefon raqam allaqachon taklif qilingan');
    }

    const newReferral = new this.referralModel({
      referrerId: new Types.ObjectId(dto.referrerId),
      friendName: dto.friendName,
      friendPhone: dto.friendPhone,
      status: 'PENDING',
      coinsAwarded: false,
    });
    return newReferral.save();
  }

  /** Admin uchun barcha referrallarni olish */
  async findAll(): Promise<any[]> {
    const referrals = await this.referralModel
      .find()
      .populate({
        path: 'referrerId',
        populate: {
          path: 'userId',
          select: 'fullName avatar',
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    return referrals.map((ref) => {
      const refObj = ref.toObject();
      if (refObj.referrerId && typeof refObj.referrerId === 'object') {
        const studentProfile = refObj.referrerId as any;
        const userObj = studentProfile.userId || {};
        refObj.referrerId = {
          _id: studentProfile._id,
          studentPhone: studentProfile.studentPhone,
          fullName: userObj.fullName || "Noma'lum",
          avatar: userObj.avatar || null,
        };
      }
      return refObj;
    });
  }

  /** Admin tasdiqlaydiya */
  async approve(id: string): Promise<any> {
    const referral = await this.referralModel.findById(id);
    if (!referral) throw new NotFoundException('Referral topilmadi');
    if (referral.status !== 'PENDING') {
      throw new BadRequestException('Bu referral allaqachon korib chiqilgan');
    }

    referral.status = 'APPROVED';

    // Taklif qilgan studentga +2000 coin berish
    if (!referral.coinsAwarded) {
      const profile = await this.studentProfileModel.findById(referral.referrerId);
      if (!profile) {
        throw new NotFoundException('Taklif qiluvchi talaba profili topilmadi');
      }

      await this.studentsService.addXpAndCoins(
        profile.userId.toString(),
        0,
        2000,
      );
      referral.coinsAwarded = true;
    }

    await referral.save();
    return { success: true, message: 'Referral tasdiqlandi va 2000 coin berildi' };
  }

  /** Admin rad etadi */
  async reject(id: string): Promise<any> {
    const referral = await this.referralModel.findById(id);
    if (!referral) throw new NotFoundException('Referral topilmadi');
    if (referral.status !== 'PENDING') {
      throw new BadRequestException('Bu referral allaqachon korib chiqilgan');
    }

    referral.status = 'REJECTED';
    await referral.save();
    return { success: true, message: 'Referral rad etildi' };
  }

  /** Referralni o'chirish */
  async delete(id: string): Promise<any> {
    const deleted = await this.referralModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Referral topilmadi');
    return { success: true };
  }

  /** Student o'z referrallarini ko'rishi */
  async findByStudent(studentProfileId: string): Promise<any[]> {
    return this.referralModel
      .find({ referrerId: new Types.ObjectId(studentProfileId) })
      .sort({ createdAt: -1 })
      .exec();
  }
}
