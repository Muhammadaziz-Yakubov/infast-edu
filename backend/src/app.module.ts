import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BranchesModule } from './modules/branches/branches.module';
import { StudentsModule } from './modules/students/students.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LmsModule } from './modules/lms/lms.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { GroupsModule } from './modules/groups/groups.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { MarketModule } from './modules/market/market.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { EventsModule } from './modules/events/events.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { ChatModule } from './modules/chat/chat.module';
import { CustomFieldsModule } from './modules/custom-fields/custom-fields.module';
import { LeadSourcesModule } from './modules/lead-sources/lead-sources.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CallsModule } from './modules/calls/calls.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { DemoLessonsModule } from './modules/demo-lessons/demo-lessons.module';
import { NotesModule } from './modules/notes/notes.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { ConversionsModule } from './modules/conversions/conversions.module';
import { CrmAnalyticsModule } from './modules/crm-analytics/crm-analytics.module';
import { AiAdvisorModule } from './modules/ai-advisor/ai-advisor.module';
import { TelegramBotModule } from './modules/telegram-bot/telegram-bot.module';
import { TelegramAiModule } from './modules/telegram-ai/telegram-ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://127.0.0.1:27017/infast-lms',
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 120, // 120 requests per minute
    }]),
    AuthModule,
    UsersModule,
    BranchesModule,
    StudentsModule,
    CoursesModule,
    LmsModule,
    HomeworkModule,
    GroupsModule,
    PaymentsModule,
    AttendanceModule,
    MarketModule,
    NotificationsModule,
    AnalyticsModule,
    EventsModule,
    ReferralsModule,
    ChatModule,
    CustomFieldsModule,
    LeadSourcesModule,
    CampaignsModule,
    ActivitiesModule,
    LeadsModule,
    CallsModule,
    MeetingsModule,
    DemoLessonsModule,
    NotesModule,
    TasksModule,
    FollowUpsModule,
    AttachmentsModule,
    RemindersModule,
    ConversionsModule,
    CrmAnalyticsModule,
    AiAdvisorModule,
    TelegramBotModule,
    TelegramAiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: any, res: any, next: any) => {
        const start = Date.now();
        res.on('finish', () => {
          const duration = Date.now() - start;
          console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
        });
        next();
      })
      .forRoutes('*');
  }
}

