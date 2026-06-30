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
export class CourseModule extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: false })
  courseId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: false })
  groupId?: Types.ObjectId;
}

export type CourseModuleDocument = CourseModule & Document;
export const CourseModuleSchema = SchemaFactory.createForClass(CourseModule);
CourseModuleSchema.index({ courseId: 1, order: 1 });
CourseModuleSchema.index({ groupId: 1, order: 1 });
