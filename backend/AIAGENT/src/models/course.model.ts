import { Schema, model, Document } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  duration: string;
  totalLessons: number;
  level: string;
  status: string;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0 },
    duration: { type: String, default: "" },
    totalLessons: { type: Number, required: true },
    level: { type: String, default: "" },
    status: { type: String, default: "DRAFT" },
  },
  {
    timestamps: true,
  }
);

export const CourseModel = model<ICourse>("Course", CourseSchema);
