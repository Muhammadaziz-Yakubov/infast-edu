import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationType } from '../../common/enums/status.enum';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role } from '../../common/enums/roles.enum';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  /**
   * Sends real push notifications via Expo Push API to mobile devices
   */
  async sendExpoPush(tokens: string[], title: string, body: string, data?: any): Promise<void> {
    const validTokens = tokens.filter(
      (t) => typeof t === 'string' && (t.startsWith('ExponentPushToken') || t.startsWith('ExpoPushToken'))
    );

    if (validTokens.length === 0) return;

    const messages = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      _displayInForeground: true,
    }));

    try {
      await axios.post('https://exp.host/--/api/v2/push/send', messages, {
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });
      this.logger.log(`[Expo Push] Successfully sent push to ${validTokens.length} devices.`);
    } catch (err: any) {
      this.logger.error(`[Expo Push Error] ${err?.message || err}`);
    }
  }

  async create(userId: string, title: string, message: string, type: NotificationType, data?: any): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      title,
      message,
      type,
    });
    const saved = await notification.save();

    // Trigger Push Notification if user has push token
    const user = await this.userModel.findById(userId).exec();
    if (user && user.expoPushToken) {
      await this.sendExpoPush([user.expoPushToken], title, message, data);
    }

    return saved;
  }

  async broadcast(title: string, message: string, data?: any): Promise<any> {
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

    // Collect all valid Expo Push Tokens and send Push Notifications
    const pushTokens = students
      .map((stud) => stud.expoPushToken)
      .filter((token): token is string => !!token);

    if (pushTokens.length > 0) {
      await this.sendExpoPush(pushTokens, title, message, data);
    }

    return { success: true, count: notifications.length, pushSentCount: pushTokens.length };
  }

  async sendPushToSpecificUser(userId: string, title: string, message: string, type: NotificationType = NotificationType.ANNOUNCEMENT, data?: any): Promise<any> {
    return this.create(userId, title, message, type, data);
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
