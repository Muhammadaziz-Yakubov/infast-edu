import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversionsService } from './conversions.service';
import { ConversionsController } from './conversions.controller';
import { LeadsModule } from '../leads/leads.module';
import { ActivitiesModule } from '../activities/activities.module';

// Schemas
import { User, UserSchema } from '../users/schemas/user.schema';
import { StudentProfile, StudentProfileSchema } from '../students/schemas/student-profile.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { Lesson, LessonSchema } from '../lms/schemas/lesson.schema';
import { LessonProgress, LessonProgressSchema } from '../lms/schemas/lesson-progress.schema';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: Lead.name, schema: LeadSchema },
    ]),
    LeadsModule,
    ActivitiesModule,
  ],
  controllers: [ConversionsController],
  providers: [ConversionsService],
  exports: [ConversionsService],
})
export class ConversionsModule {}
