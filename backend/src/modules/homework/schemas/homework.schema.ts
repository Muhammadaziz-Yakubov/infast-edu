import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TaskType {
  QUIZ = 'QUIZ',
  TEXT = 'TEXT',
  CODE = 'CODE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

@Schema({ _id: false })
export class HomeworkTask {
  @Prop({ required: true })
  id: string; // e.g. "task_1"

  @Prop({ type: String, enum: TaskType, required: true })
  type: TaskType;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], default: [] })
  options?: string[]; // Options for multiple choice/quizzes

  @Prop({ required: true })
  correctAnswer: string; // Used for automatic grading
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
export class Homework extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, unique: true })
  lessonId: Types.ObjectId;

  @Prop({ type: [HomeworkTask], required: true })
  tasks: HomeworkTask[];

  @Prop({ required: true, min: 0 })
  xpReward: number;

  @Prop({ required: true, min: 0 })
  coinReward: number;
}

export type HomeworkDocument = Homework & Document;
export const HomeworkSchema = SchemaFactory.createForClass(Homework);
