import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'ChatRoom', required: true })
  roomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  senderName: string;

  @Prop({ default: null })
  senderAvatar?: string;

  @Prop({ required: true })
  text: string;

  // Array of user IDs who have read the message
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  readBy: Types.ObjectId[];
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Index for fast room message queries
ChatMessageSchema.index({ roomId: 1, createdAt: -1 });
