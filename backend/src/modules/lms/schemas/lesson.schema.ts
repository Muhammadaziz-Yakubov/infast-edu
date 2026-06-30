import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class QuizQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true })
  correctAnswerIndex: number;

  @Prop({ required: true, default: 1 })
  round: number;
}

@Schema({ _id: false })
export class LessonPractice {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 'html' })
  language: string;

  @Prop({ default: '' })
  starterCode: string;

  @Prop({ default: 'contains' })
  validationType: string;

  @Prop({ type: [String], default: [] })
  validationRules: string[];

  @Prop({ default: 100 })
  xpReward: number;

  @Prop({ default: 20 })
  coinReward: number;
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
export class Lesson extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'CourseModule', required: true })
  moduleId: Types.ObjectId;

  @Prop({ type: [QuizQuestion], default: [] })
  quiz?: QuizQuestion[];

  @Prop({ default: 80 })
  passingScore?: number;
}

export type LessonDocument = Lesson & Document;
export const LessonSchema = SchemaFactory.createForClass(Lesson);
LessonSchema.index({ moduleId: 1, order: 1 });
