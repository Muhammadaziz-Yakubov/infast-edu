import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LeadStatus {
  NEW_LEAD = 'NEW_LEAD',
  CONTACTED = 'CONTACTED',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  DEMO_LESSON = 'DEMO_LESSON',
  REGISTERED = 'REGISTERED',
  CONVERTED = 'CONVERTED',
  CLOSED = 'CLOSED',
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum LostLeadReason {
  TOO_EXPENSIVE = 'TOO_EXPENSIVE',
  NO_TIME = 'NO_TIME',
  NOT_INTERESTED = 'NOT_INTERESTED',
  COMPETITOR = 'COMPETITOR',
  NO_COMPUTER = 'NO_COMPUTER',
  PARENTS_REJECTED = 'PARENTS_REJECTED',
  WRONG_NUMBER = 'WRONG_NUMBER',
  NO_RESPONSE = 'NO_RESPONSE',
  OTHER = 'OTHER',
}

@Schema({
  _id: false,
})
export class LeadCustomField {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;
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
export class Lead extends Document {
  // Personal
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, index: true })
  phone: string;

  @Prop({ index: true })
  secondPhone?: string;

  @Prop()
  birthDate?: string;

  @Prop()
  age?: number;

  @Prop()
  gender?: string;

  // Parent
  @Prop()
  parentName?: string;

  @Prop({ index: true })
  parentPhone?: string;

  // Education
  @Prop()
  school?: string;

  @Prop()
  grade?: string;

  // Address
  @Prop()
  region?: string;

  @Prop()
  district?: string;

  @Prop()
  address?: string;

  // Learning
  @Prop({ type: Types.ObjectId, ref: 'Course', index: true })
  interestedCourse?: Types.ObjectId;

  @Prop()
  preferredTime?: string;

  // Marketing
  @Prop({ type: Types.ObjectId, ref: 'LeadSource', index: true })
  source?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Campaign', index: true })
  campaign?: Types.ObjectId;

  @Prop()
  advertisement?: string;

  @Prop()
  utmSource?: string;

  @Prop()
  utmMedium?: string;

  @Prop()
  utmCampaign?: string;

  // CRM
  @Prop({ type: String, enum: LeadStatus, default: LeadStatus.NEW_LEAD, index: true })
  status: LeadStatus;

  @Prop({ type: String, enum: LeadPriority, default: LeadPriority.MEDIUM, index: true })
  priority: LeadPriority;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedManager?: Types.ObjectId;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: String, enum: LostLeadReason, index: true })
  lostReason?: LostLeadReason;

  // Lead Scoring
  @Prop({ type: Number, default: 0, index: true })
  score: number;

  // Custom Fields
  @Prop({ type: [LeadCustomField], default: [] })
  customFields: LeadCustomField[];

  // Statistics
  @Prop({ type: Number, default: 0 })
  callCount: number;

  @Prop({ type: Number, default: 0 })
  meetingCount: number;

  @Prop({ type: Number, default: 0 })
  demoCount: number;

  // Soft Delete & Archive
  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;

  @Prop({ type: Boolean, default: false, index: true })
  isArchived: boolean;

  @Prop({ type: Date })
  archivedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  archivedBy?: Types.ObjectId;

  // Dates & Tracking Indicators
  @Prop({ type: Date })
  contactedAt?: Date;

  @Prop({ type: Date })
  demoDate?: Date;

  @Prop({ type: Date })
  convertedAt?: Date;

  @Prop({ type: Date, index: true })
  lastContactAt?: Date;

  @Prop({ type: Date, index: true })
  nextFollowUpAt?: Date;

  @Prop({ type: Date, index: true })
  lastActivityAt?: Date;
}

export type LeadDocument = Lead & Document;
export const LeadSchema = SchemaFactory.createForClass(Lead);

// Complex compound indexes for search performance optimization
LeadSchema.index({ firstName: 'text', lastName: 'text', phone: 'text' });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ score: -1, status: 1 });
