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

  @Prop({ default: '' })
  videoUrl?: string; // YouTube embed link

  @Prop({ required: true })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'CourseModule', required: true })
  moduleId: Types.ObjectId;

  @Prop()
  textContent?: string;

  @Prop({ type: [String], default: [] })
  practiceTasks?: string[];

  @Prop({ type: [QuizQuestion], default: [] })
  quiz?: QuizQuestion[];
}

export type LessonDocument = Lesson & Document;
export const LessonSchema = SchemaFactory.createForClass(Lesson);
LessonSchema.index({ moduleId: 1, order: 1 });
