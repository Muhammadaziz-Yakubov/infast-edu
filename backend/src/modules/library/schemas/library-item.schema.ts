import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LibraryItemDocument = LibraryItem & Document;

@Schema({ timestamps: true })
export class LibraryItem {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['VIDEO', 'BOOK'] })
  type: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: false, default: '' })
  thumbnailUrl: string;

  @Prop({ required: false, default: 'InFast IT Academy' })
  author: string;

  @Prop({ required: false, default: 'Dasturlash' })
  category: string;
}

export const LibraryItemSchema = SchemaFactory.createForClass(LibraryItem);
