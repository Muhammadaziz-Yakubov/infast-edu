import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AiChatDocument = AiChat & Document;

@Schema({ _id: false })
export class ChatMessage {
  @Prop({ required: true, enum: ['user', 'assistant', 'system'] })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

@Schema({ timestamps: true })
export class AiChat {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: false })
  groupId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: false })
  courseId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourseModule', required: false })
  moduleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: false })
  lessonId?: Types.ObjectId;

  @Prop({ type: [ChatMessage], default: [] })
  messages: ChatMessage[];

  @Prop()
  difficulty?: string;

  @Prop()
  language?: string;

  @Prop({ type: [String], default: [] })
  quickActions?: string[];
}

export const AiChatSchema = SchemaFactory.createForClass(AiChat);
