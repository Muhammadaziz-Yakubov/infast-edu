import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AttendanceStatus } from '../../../common/enums/status.enum';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).__v;
      return ret;
    },
  },
})
export class Attendance extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  groupId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: false })
  lessonId?: Types.ObjectId;

  @Prop({ type: Number })
  lessonNumber?: number;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ type: String, enum: AttendanceStatus, required: true })
  status: AttendanceStatus;

  // GPS & Geofencing metadata
  @Prop({ type: Number, required: false })
  latitude?: number;

  @Prop({ type: Number, required: false })
  longitude?: number;

  @Prop({ type: Number, required: false })
  distanceFromAcademy?: number;

  @Prop({ type: Boolean, default: false })
  isGeofenced?: boolean;

  @Prop({ type: Boolean, default: false })
  isMockedLocation?: boolean;

  @Prop({ type: Date, required: false })
  checkInTime?: Date;
}

export type AttendanceDocument = Attendance & Document;
export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index({ studentId: 1, lessonId: 1 }, { unique: false });
AttendanceSchema.index({ studentId: 1, groupId: 1, lessonNumber: 1 });
AttendanceSchema.index({ groupId: 1, lessonId: 1 });
AttendanceSchema.index({ groupId: 1, lessonNumber: 1 });
AttendanceSchema.index({ date: -1 });
