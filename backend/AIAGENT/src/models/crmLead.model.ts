import { Schema, model, Document, Types } from "mongoose";

export interface ICrmLead extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  secondPhone?: string;
  birthDate?: string;
  age?: number;
  gender?: string;
  parentName?: string;
  parentPhone?: string;
  school?: string;
  grade?: string;
  region?: string;
  district?: string;
  address?: string;
  interestedCourse?: Types.ObjectId;
  preferredTime?: string;
  status: string;
  priority: string;
  score: number;
  tags: string[];
  isDeleted: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CrmLeadSchema = new Schema<ICrmLead>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    secondPhone: { type: String },
    birthDate: { type: String },
    age: { type: Number },
    gender: { type: String },
    parentName: { type: String },
    parentPhone: { type: String },
    school: { type: String },
    grade: { type: String },
    region: { type: String },
    district: { type: String },
    address: { type: String },
    interestedCourse: { type: Schema.Types.ObjectId, ref: "Course", index: true },
    preferredTime: { type: String },
    status: { type: String, default: "NEW_LEAD", index: true },
    priority: { type: String, default: "MEDIUM", index: true },
    score: { type: Number, default: 10, index: true },
    tags: { type: [String], default: ["AI_AGENT"] },
    isDeleted: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Explicitly register as CrmLead to avoid conflict with AgentLead,
// but bind to the "leads" collection in the database.
export const CrmLeadModel = model<ICrmLead>("CrmLead", CrmLeadSchema, "leads");
