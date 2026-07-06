import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';
import { TelegramBotLog, TelegramBotLogSchema } from './schemas/telegram-bot-log.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { StudentProfile, StudentProfileSchema } from '../students/schemas/student-profile.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Course.name, schema: CourseSchema },
      { name: TelegramBotLog.name, schema: TelegramBotLogSchema },
    ]),
  ],
  controllers: [TelegramBotController],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}
