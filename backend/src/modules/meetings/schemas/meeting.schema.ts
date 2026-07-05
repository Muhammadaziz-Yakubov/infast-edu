import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW',
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
export class Meeting extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true, index: true })
  leadId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  time: string; // e.g. "15:00"

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacher: Types.ObjectId;

  @Prop({ required: true })
  location: string; // e.g. "Room #102" or "Zoom link"

  @Prop({ required: true })
  meetingType: string; // e.g. "Introduction", "Interview", "Consultation"

  @Prop({ required: true, type: String, enum: MeetingStatus, default: MeetingStatus.SCHEDULED })
  status: MeetingStatus;
}

export type MeetingDocument = Meeting & Document;
export const MeetingSchema = SchemaFactory.createForClass(Meeting);
