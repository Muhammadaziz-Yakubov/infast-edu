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
export class PracticeTask extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, unique: true })
  lessonId: Types.ObjectId;

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

  @Prop({ default: 50 })
  xpReward: number;

  @Prop({ default: 10 })
  coinReward: number;
}

export type PracticeTaskDocument = PracticeTask & Document;
export const PracticeTaskSchema = SchemaFactory.createForClass(PracticeTask);
PracticeTaskSchema.index({ lessonId: 1 });
