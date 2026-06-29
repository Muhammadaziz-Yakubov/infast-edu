import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CourseStatus } from '../../../common/enums/status.enum';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).__v;
      return ret;
    },
  },
})
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  thumbnail?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  duration: string; // e.g., "6 months"

  @Prop({ required: true, min: 0 })
  totalLessons: number; // e.g., 114

  @Prop({ required: true })
  level: string; // e.g., "Frontend Beginner", "Intermediate"

  @Prop({ type: String, enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;
}

export type CourseDocument = Course & Document;
export const CourseSchema = SchemaFactory.createForClass(Course);
