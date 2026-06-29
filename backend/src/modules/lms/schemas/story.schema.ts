import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ required: true, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' })
  mediaType: string;

  @Prop()
  thumbnail?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  viewers: Types.ObjectId[];

  @Prop({ default: 5 })
  duration: number; // Duration in seconds to show the story
}

export const StorySchema = SchemaFactory.createForClass(Story);
