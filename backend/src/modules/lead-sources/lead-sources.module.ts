import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadSourcesService } from './lead-sources.service';
import { LeadSourcesController } from './lead-sources.controller';
import { LeadSource, LeadSourceSchema } from './schemas/lead-source.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeadSource.name, schema: LeadSourceSchema },
    ]),
  ],
  controllers: [LeadSourcesController],
  providers: [LeadSourcesService],
  exports: [LeadSourcesService, MongooseModule],
})
export class LeadSourcesModule {}
