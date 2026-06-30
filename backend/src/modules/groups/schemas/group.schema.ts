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

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  students: Types.ObjectId[];

  @Prop({ type: Schedule, required: true })
  schedule: Schedule;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 1, min: 1 })
  startLessonOrder: number; // Guruh uchun qaysi dars tartib raqamidan boshlanishi (oldingilari lock)
}

export type GroupDocument = Group & Document;
export const GroupSchema = SchemaFactory.createForClass(Group);
GroupSchema.index({ courseId: 1 });
