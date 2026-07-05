import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum FollowUpStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
export class FollowUp extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true, index: true })
  leadId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  time: string; // e.g. "12:30"

  @Prop({ required: true })
  reason: string; // e.g. "To check computer availability"

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  assignedManager: Types.ObjectId;

  @Prop({ required: true, type: String, enum: FollowUpStatus, default: FollowUpStatus.PENDING, index: true })
  status: FollowUpStatus;

  @Prop({ type: Date })
  completedAt?: Date;
}

export type FollowUpDocument = FollowUp & Document;
export const FollowUpSchema = SchemaFactory.createForClass(FollowUp);
