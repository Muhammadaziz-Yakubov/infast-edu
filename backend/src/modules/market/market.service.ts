import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reward, RewardDocument } from './schemas/reward.schema';
import { PurchaseHistory, PurchaseHistoryDocument } from './schemas/purchase-history.schema';
import { StudentProfile, StudentProfileDocument } from '../students/schemas/student-profile.schema';
import { StudentsService } from '../students/students.service';
import { Notification, NotificationDocument } from '../notifications/schemas/notification.schema';
import { CreateRewardDto } from './dto/create-reward.dto';
import { NotificationType } from '../../common/enums/status.enum';

@Injectable()
export class MarketService {
  constructor(
    @InjectModel(Reward.name)
    private readonly rewardModel: Model<RewardDocument>,
    @InjectModel(PurchaseHistory.name)
    private readonly purchaseHistoryModel: Model<PurchaseHistoryDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly studentsService: StudentsService
  ) {}

  // Admin Reward CRUD
  async createReward(dto: CreateRewardDto): Promise<RewardDocument> {
    const reward = new this.rewardModel(dto);
    return reward.save();
  }

  async updateReward(id: string, dto: any): Promise<RewardDocument> {
    const updated = await this.rewardModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Reward item not found');
    return updated;
  }

  async removeReward(id: string): Promise<RewardDocument> {
    const deleted = await this.rewardModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Reward item not found');
    return deleted;
  }

  // Market Access
  async getAllRewards(): Promise<RewardDocument[]> {
    return this.rewardModel.find().exec();
  }

  async getRewardById(id: string): Promise<RewardDocument> {
    const reward = await this.rewardModel.findById(id).exec();
    if (!reward) throw new NotFoundException('Reward item not found');
    return reward;
  }

  // Purchase / Redeem System
  async purchaseReward(studentId: string, rewardId: string): Promise<any> {
    const reward = await this.getRewardById(rewardId);

    // 1. Check stock
    if (reward.stock <= 0) {
      throw new BadRequestException('Reward is out of stock.');
    }

    // 2. Check student coins
    const profile = await this.studentProfileModel.findOne({ userId: new Types.ObjectId(studentId) }).exec();
    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    if (profile.coins < reward.coinPrice) {
      throw new BadRequestException(`Insufficient coins. Required: ${reward.coinPrice}, You have: ${profile.coins}`);
    }

    // 3. Deduct coins and stock
    await this.studentsService.addXpAndCoins(studentId, 0, -reward.coinPrice);
    reward.stock = reward.stock - 1;
    await reward.save();

    // 4. Log purchase
    const purchase = new this.purchaseHistoryModel({
      studentId: new Types.ObjectId(studentId),
      rewardId: reward._id,
      coinPrice: reward.coinPrice,
      purchaseDate: new Date(),
    });
    await purchase.save();

    // 5. Generate purchase notification
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(studentId),
      title: 'Reward Redeemed!',
      message: `You successfully redeemed ${reward.name} for ${reward.coinPrice} coins. Please collect it from administration.`,
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
    });
    await notification.save();

    return {
      success: true,
      purchase,
      remainingCoins: profile.coins - reward.coinPrice,
    };
  }

  async getStudentPurchaseHistory(studentId: string): Promise<PurchaseHistoryDocument[]> {
    return this.purchaseHistoryModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('rewardId')
      .sort({ purchaseDate: -1 })
      .exec();
  }

  async getAllPurchaseHistory(): Promise<PurchaseHistoryDocument[]> {
    return this.purchaseHistoryModel
      .find()
      .populate('studentId', 'fullName email phone')
      .populate('rewardId')
      .sort({ purchaseDate: -1 })
      .exec();
  }
}
