import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class StudentAnswer {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true })
  answer: string;
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
export class HomeworkSubmission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Homework', required: true })
  homeworkId: Types.ObjectId;

  @Prop({ type: [StudentAnswer], required: true })
  answers: StudentAnswer[];

  @Prop({ required: true, min: 0, max: 100 })
  score: number; // e.g. percentage of correct answers (0-100)

  @Prop({ required: true, default: Date.now })
  completedAt: Date;
}

export type HomeworkSubmissionDocument = HomeworkSubmission & Document;
export const HomeworkSubmissionSchema = SchemaFactory.createForClass(HomeworkSubmission);
// Make sure a student can submit homework only once
HomeworkSubmissionSchema.index({ studentId: 1, homeworkId: 1 }, { unique: true });
