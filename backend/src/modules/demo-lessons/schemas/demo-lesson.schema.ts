import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum DemoResult {
  PASSED = 'PASSED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  THINKING = 'THINKING',
  WILL_REGISTER = 'WILL_REGISTER',
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
export class DemoLesson extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true, index: true })
  leadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  group: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, type: Boolean, default: false })
  attendance: boolean;

  @Prop()
  feedback?: string;

  @Prop({ type: String, enum: DemoResult, default: DemoResult.THINKING })
  result: DemoResult;
}

export type DemoLessonDocument = DemoLesson & Document;
export const DemoLessonSchema = SchemaFactory.createForClass(DemoLesson);
