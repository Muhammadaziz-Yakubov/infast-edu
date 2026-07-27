import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  _id: false,
})
export class Schedule {
  @Prop({ type: [String], required: true })
  days: string[]; // e.g. ["Tuesday", "Thursday", "Saturday"]

  @Prop({ required: true })
  time: string; // e.g. "18:30 - 20:00"
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
export class Group extends Document {
  @Prop({ required: true })
  name: string; // e.g. "Frontend Beginner #1"

  @Prop({ type: Types.ObjectId, ref: 'Course', required: false })
  courseId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  students: Types.ObjectId[];

  @Prop({ type: Schedule, required: true })
  schedule: Schedule;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  primaryTeacherId?: Types.ObjectId;

  @Prop({ default: 'Main Room' })
  roomId?: string;

  @Prop({ default: 20 })
  capacity?: number;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop({ required: false })
  startDate?: Date;

  @Prop({ required: false })
  endDate?: Date;

  @Prop({ default: 1, min: 1 })
  startLessonOrder?: number;

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  branchId?: Types.ObjectId;
}

export type GroupDocument = Group & Document;
export const GroupSchema = SchemaFactory.createForClass(Group);
GroupSchema.index({ courseId: 1 });
GroupSchema.index({ primaryTeacherId: 1 });

