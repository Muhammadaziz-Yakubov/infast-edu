import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../../../common/enums/status.enum';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).__v;
      return ret;
    },
  },
})
export class StudentProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ unique: true, sparse: true })
  studentPhone?: string;

  @Prop()
  parentPhone?: string;

  @Prop()
  dateOfBirth?: string;

  @Prop({ default: false })
  mustChangePassword?: boolean;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 0 })
  coins: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  groupId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId?: Types.ObjectId;

  // Independent Student Learning Progress Engine
  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  currentLessonId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }], default: [] })
  completedLessonIds: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }], default: [] })
  unlockedLessonIds: Types.ObjectId[];

  @Prop({ default: 0 })
  progressPercentage: number; // e.g. 45%

  // Dynamic Payment Cycle Engine
  @Prop({ default: Date.now })
  joiningDate: Date;

  @Prop()
  nextPaymentDate?: Date;

  @Prop({ default: 500000 })
  monthlyFee: number;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UPCOMING })
  paymentStatus: PaymentStatus;

  @Prop({ default: 100 })
  attendancePercentage: number; // e.g. 95%

  @Prop({ default: 0 })
  homeworkProgress: number; // e.g. 80%

  // Gamification Engine
  @Prop({ default: 'NOVICE' })
  rank: string;

  @Prop({ default: 0 })
  streakDays: number;
}

export type StudentProfileDocument = StudentProfile & Document;
export const StudentProfileSchema = SchemaFactory.createForClass(StudentProfile);
StudentProfileSchema.index({ groupId: 1 });
StudentProfileSchema.index({ courseId: 1 });
StudentProfileSchema.index({ userId: 1 });

