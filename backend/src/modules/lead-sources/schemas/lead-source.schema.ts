import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).__v;
      return ret;
    },
  },
})
export class LeadSource extends Document {
  @Prop({ required: true, unique: true, index: true })
  name: string; // e.g. "Instagram", "Telegram", "Google"
}

export type LeadSourceDocument = LeadSource & Document;
export const LeadSourceSchema = SchemaFactory.createForClass(LeadSource);
