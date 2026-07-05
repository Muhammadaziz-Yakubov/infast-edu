import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CustomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
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
export class CustomFieldDefinition extends Document {
  @Prop({ required: true, unique: true, index: true })
  key: string; // e.g. "github_username"

  @Prop({ required: true })
  label: string; // e.g. "GitHub Username"

  @Prop({ required: true, type: String, enum: CustomFieldType })
  type: CustomFieldType;

  @Prop({ type: [String], default: [] })
  options?: string[]; // for SELECT type
}

export type CustomFieldDefinitionDocument = CustomFieldDefinition & Document;
export const CustomFieldDefinitionSchema = SchemaFactory.createForClass(CustomFieldDefinition);
