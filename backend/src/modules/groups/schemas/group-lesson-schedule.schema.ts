import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).__v;
      return ret;
    },
  },
})
export class GroupLessonSchedule extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  groupId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lessonId: Types.ObjectId;

  @Prop({ required: true })
  scheduledDate: Date;

  @Prop({ required: true })
  order: number; // Lesson sequence order for the schedule
}

export type GroupLessonScheduleDocument = GroupLessonSchedule & Document;
export const GroupLessonScheduleSchema = SchemaFactory.createForClass(GroupLessonSchedule);
// Compound index to quickly find lessons for a group
GroupLessonScheduleSchema.index({ groupId: 1, scheduledDate: 1 });
GroupLessonScheduleSchema.index({ groupId: 1, lessonId: 1 }, { unique: true });
