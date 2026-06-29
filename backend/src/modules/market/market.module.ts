import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { Reward, RewardSchema } from './schemas/reward.schema';
import { PurchaseHistory, PurchaseHistorySchema } from './schemas/purchase-history.schema';
import { StudentProfile, StudentProfileSchema } from '../students/schemas/student-profile.schema';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reward.name, schema: RewardSchema },
      { name: PurchaseHistory.name, schema: PurchaseHistorySchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    StudentsModule,
  ],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
