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
export class Contract extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  studentId: Types.ObjectId; // Refers to student user ID

  @Prop({ required: true, unique: true })
  contractNumber: string; // e.g. CN-2026-000001

  @Prop({ required: true })
  status: string; // 'GENERATED'

  @Prop({ required: true })
  generatedDate: Date;

  // Metadata captured for the contract
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  address?: string;

  @Prop()
  passportOrJshshir?: string;

  @Prop()
  parentName?: string;

  @Prop()
  parentPhone?: string;

  @Prop({ required: true })
  courseName: string;

  @Prop({ required: true })
  groupName: string;

  @Prop({ required: true })
  monthlyPayment: number;

  @Prop({ required: true })
  contractDate: Date;

  @Prop({ required: true })
  pdfUrl: string; // The URL/path to access the PDF: /uploads/contracts/CN-XXXXXX.pdf
}

export type ContractDocument = Contract & Document;
export const ContractSchema = SchemaFactory.createForClass(Contract);
ContractSchema.index({ studentId: 1 });
