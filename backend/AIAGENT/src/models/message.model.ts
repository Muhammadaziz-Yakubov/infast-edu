import { Schema, model, Document } from "mongoose";

export interface IMessage extends Document {
  messageId: string; // Format: "chatId_msgId"
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  direction: "incoming" | "outgoing";
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    messageId: { type: String, required: true, unique: true },
    chatId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, default: "" },
    text: { type: String, required: true },
    direction: { type: String, enum: ["incoming", "outgoing"], required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch context history for a chat, sorted by time
MessageSchema.index({ chatId: 1, timestamp: -1 });

export const MessageModel = model<IMessage>("Message", MessageSchema);
