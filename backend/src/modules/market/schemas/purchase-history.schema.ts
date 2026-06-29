import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).__v;
      return ret;
    },
  },
})
export class PurchaseHistory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Reward', required: true })
  rewardId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  coinPrice: number;

  @Prop({ required: true, default: Date.now })
  purchaseDate: Date;
}

export type PurchaseHistoryDocument = PurchaseHistory & Document;
export const PurchaseHistorySchema = SchemaFactory.createForClass(PurchaseHistory);
PurchaseHistorySchema.index({ studentId: 1 });
