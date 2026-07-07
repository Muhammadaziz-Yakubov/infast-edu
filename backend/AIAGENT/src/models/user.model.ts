import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  phone: string;
  studentPhone?: string;
  parentPhone?: string;
  role: string;
  status: string;
  telegramId?: string;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    studentPhone: { type: String },
    parentPhone: { type: String },
    role: { type: String, required: true },
    status: { type: String, required: true },
    telegramId: { type: String },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUser>("User", UserSchema, "users");
