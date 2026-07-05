import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).__v;
      return ret;
    },
  },
})
export class Campaign extends Document {
  @Prop({ required: true, index: true })
  name: string; // e.g. "Summer Sale 2026"

  @Prop({ required: true })
  platform: string; // e.g. "Instagram", "Facebook Ads"

  @Prop({ required: true, type: Number })
  budget: number;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, type: String, enum: CampaignStatus, default: CampaignStatus.ACTIVE })
  status: CampaignStatus;
}

export type CampaignDocument = Campaign & Document;
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
