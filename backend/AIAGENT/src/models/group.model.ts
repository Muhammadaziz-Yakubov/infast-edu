import { Schema, model, Document, Types } from "mongoose";

export interface IGroup extends Document {
  name: string;
  courseId: Types.ObjectId;
  students: Types.ObjectId[];
  schedule: {
    days: string[];
    time: string;
  };
  startDate: Date;
  endDate: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    students: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    schedule: {
      days: { type: [String], required: true },
      time: { type: String, required: true },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export const GroupModel = model<IGroup>("Group", GroupSchema, "groups");
