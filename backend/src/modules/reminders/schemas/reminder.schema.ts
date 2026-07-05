import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ReminderType {
  NO_CALL_24H = 'NO_CALL_24H',
  MEETING_TOMORROW = 'MEETING_TOMORROW',
  DEMO_TOMORROW = 'DEMO_TOMORROW',
  OVERDUE_TASK = 'OVERDUE_TASK',
  COLD_LEAD = 'COLD_LEAD',
  FOLLOW_UP_TODAY = 'FOLLOW_UP_TODAY',
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
export class Reminder extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true, index: true })
  leadId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, type: String, enum: ReminderType, index: true })
  type: ReminderType;

  @Prop({ required: true, type: Date, default: Date.now, index: true })
  dueAt: Date;

  @Prop({ required: true, type: Boolean, default: false, index: true })
  isTriggered: boolean;
}

export type ReminderDocument = Reminder & Document;
export const ReminderSchema = SchemaFactory.createForClass(Reminder);
