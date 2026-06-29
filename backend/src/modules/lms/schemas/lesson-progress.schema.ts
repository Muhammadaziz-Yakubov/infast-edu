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
export class LessonProgress extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lessonId: Types.ObjectId;

  @Prop({ required: true, default: false })
  completed: boolean;

  @Prop({ min: 0, max: 100, default: 0 })
  score: number; // Score achieved on quizzes if any (0-100)

  @Prop({ type: [Number], default: [] })
  quizAnswers: number[];

  @Prop({ required: true, default: 0 })
  completedRounds: number;

  @Prop()
  completionDate?: Date;
}

export type LessonProgressDocument = LessonProgress & Document;
export const LessonProgressSchema = SchemaFactory.createForClass(LessonProgress);
// Force uniqueness per student/lesson progress tracking
LessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
