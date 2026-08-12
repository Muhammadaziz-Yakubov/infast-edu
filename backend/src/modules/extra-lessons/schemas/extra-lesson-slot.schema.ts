import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ExtraLessonSlotStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ExtraLessonAttendanceStatus {
  PENDING = 'PENDING',
  ATTENDED = 'ATTENDED',
  ABSENT = 'ABSENT',
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
export class ExtraLessonSlot extends Document {
  @Prop({ required: true })
  date: string; // YYYY-MM-DD format

  @Prop({ required: true })
  startTime: string; // e.g. "16:00"

  @Prop({ default: "Qo'shimcha dars" })
  title: string;

  @Prop()
  note?: string;

  @Prop({
    type: String,
    enum: ExtraLessonSlotStatus,
    default: ExtraLessonSlotStatus.AVAILABLE,
  })
  status: ExtraLessonSlotStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  bookedBy?: Types.ObjectId;

  @Prop()
  reason?: string;

  @Prop({ type: Date })
  bookedAt?: Date;

  @Prop({
    type: String,
    enum: ExtraLessonAttendanceStatus,
    default: ExtraLessonAttendanceStatus.PENDING,
  })
  attendanceStatus: ExtraLessonAttendanceStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export type ExtraLessonSlotDocument = ExtraLessonSlot & Document;
export const ExtraLessonSlotSchema = SchemaFactory.createForClass(ExtraLessonSlot);
ExtraLessonSlotSchema.index({ date: 1, startTime: 1 });
ExtraLessonSlotSchema.index({ bookedBy: 1 });
