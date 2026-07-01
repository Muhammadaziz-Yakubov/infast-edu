import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatRoomDocument = ChatRoom & Document;

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['GROUP', 'DIRECT'], default: 'DIRECT' })
  type: 'GROUP' | 'DIRECT';

  @Prop({ type: Types.ObjectId, ref: 'Group', default: null })
  groupId?: Types.ObjectId;

  // All participant user IDs (students + admin)
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  participants: Types.ObjectId[];

  @Prop({ default: null })
  lastMessage?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  lastSenderId?: Types.ObjectId;

  @Prop({ default: null })
  lastMessageAt?: Date;

  @Prop({ default: null })
  avatar?: string;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
