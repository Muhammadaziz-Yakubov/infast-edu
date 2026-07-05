import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiAdvisorController } from './ai-advisor.controller';
import { AiAdvisorService } from './ai-advisor.service';

import { User, UserSchema } from '../users/schemas/user.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { Attendance, AttendanceSchema } from '../attendance/schemas/attendance.schema';
import { Campaign, CampaignSchema } from '../campaigns/schemas/campaign.schema';
import { HomeworkSubmission, HomeworkSubmissionSchema } from '../homework/schemas/homework-submission.schema';
import { LessonProgress, LessonProgressSchema } from '../lms/schemas/lesson-progress.schema';
import { Meeting, MeetingSchema } from '../meetings/schemas/meeting.schema';
import { DemoLesson, DemoLessonSchema } from '../demo-lessons/schemas/demo-lesson.schema';
import { Homework, HomeworkSchema } from '../homework/schemas/homework.schema';
import { LeadSource, LeadSourceSchema } from '../lead-sources/schemas/lead-source.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Lead.name, schema: LeadSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: HomeworkSubmission.name, schema: HomeworkSubmissionSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: Meeting.name, schema: MeetingSchema },
      { name: DemoLesson.name, schema: DemoLessonSchema },
      { name: Homework.name, schema: HomeworkSchema },
      { name: LeadSource.name, schema: LeadSourceSchema },
    ]),
  ],
  controllers: [AiAdvisorController],
  providers: [AiAdvisorService],
  exports: [AiAdvisorService],
})
export class AiAdvisorModule {}
