import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  studentId: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  nextPaymentDate: Date;
  status: string;
  paymentMethod?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    nextPaymentDate: { type: Date, required: true },
    status: { type: String, required: true },
    paymentMethod: { type: String },
  },
  {
    timestamps: true,
  }
);

export const PaymentModel = model<IPayment>("Payment", PaymentSchema, "payments");
