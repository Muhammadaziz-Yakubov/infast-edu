import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AttachmentType {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  PASSPORT = 'PASSPORT',
  CONTRACT = 'CONTRACT',
  RECEIPT = 'RECEIPT',
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
export class Attachment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true, index: true })
  leadId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, type: String, enum: AttachmentType })
  type: AttachmentType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  uploadedAt: Date;
}

export type AttachmentDocument = Attachment & Document;
export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
