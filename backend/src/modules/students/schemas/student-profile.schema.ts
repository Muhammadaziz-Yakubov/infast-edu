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

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UPCOMING })
  paymentStatus: PaymentStatus;

  @Prop({ default: 100 })
  attendancePercentage: number; // e.g. 95%

  @Prop({ default: 0 })
  homeworkProgress: number; // e.g. 80% (homeworks completed / total homeworks)
}

export type StudentProfileDocument = StudentProfile & Document;
export const StudentProfileSchema = SchemaFactory.createForClass(StudentProfile);
StudentProfileSchema.index({ groupId: 1 });
StudentProfileSchema.index({ courseId: 1 });
