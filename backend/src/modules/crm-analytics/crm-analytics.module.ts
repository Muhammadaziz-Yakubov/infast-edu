import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrmAnalyticsService } from './crm-analytics.service';
import { CrmAnalyticsController } from './crm-analytics.controller';
import { LeadsModule } from '../leads/leads.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    LeadsModule,
    CampaignsModule,
    UsersModule,
  ],
  controllers: [CrmAnalyticsController],
  providers: [CrmAnalyticsService],
  exports: [CrmAnalyticsService],
})
export class CrmAnalyticsModule {}
