import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadFormsController } from './lead-forms.controller';
import { LeadFormsService } from './lead-forms.service';
import { LeadForm, LeadFormSchema } from './schemas/lead-form.schema';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeadForm.name, schema: LeadFormSchema },
      { name: Lead.name, schema: LeadSchema },
    ]),
  ],
  controllers: [LeadFormsController],
  providers: [LeadFormsService],
  exports: [LeadFormsService],
})
export class LeadFormsModule {}
