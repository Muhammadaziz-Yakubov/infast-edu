import { Schema, model, Document } from "mongoose";

export interface ILead extends Document {
  chatId: string;
  name: string;
  username: string;
  keywordsMatched: string[];
  lastMessage: string;
  status: "new" | "contacted" | "converted";
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    chatId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, default: "" },
    keywordsMatched: { type: [String], required: true },
    lastMessage: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "contacted", "converted"],
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LeadModel = model<ILead>("AgentLead", LeadSchema);