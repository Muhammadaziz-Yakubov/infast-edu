import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationType } from '../../common/enums/status.enum';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role } from '../../common/enums/roles.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async create(userId: string, title: string, message: string, type: NotificationType): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      title,
      message,
      type,
    });
    return notification.save();
  }

  async broadcast(title: string, message: string): Promise<any> {
    const students = await this.userModel.find({ role: Role.STUDENT }).exec();
    const notifications = students.map((stud) => ({
      userId: stud._id,
      title,
      message,
      type: NotificationType.ANNOUNCEMENT,
      read: false,
    }));
    if (notifications.length > 0) {
      await this.notificationModel.insertMany(notifications);
    }
    return { success: true, count: notifications.length };
  }

  async getNotifications(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationDocument> {
    const updated = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { read: true },
      { new: true }
    ).exec();

    if (!updated) {
      throw new NotFoundException('Notification not found');
    }
    return updated;
  }

  async markAllAsRead(userId: string): Promise<any> {
    return this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { read: true }
    ).exec();
  }
}
