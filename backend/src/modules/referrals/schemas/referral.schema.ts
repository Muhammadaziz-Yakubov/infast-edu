import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReferralDocument = Referral & Document;

export type ReferralStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

@Schema({ timestamps: true })
export class Referral {
  @Prop({ type: Types.ObjectId, ref: 'StudentProfile', required: true })
  referrerId: Types.ObjectId; // Taklif qilgan studentning StudentProfile ID si

  @Prop({ required: true, trim: true })
  friendName: string; // Do'stning ismi

  @Prop({ required: true, trim: true })
  friendPhone: string; // Do'stning telefon raqami

  @Prop({ type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  status: ReferralStatus;

  @Prop({ default: false })
  coinsAwarded: boolean; // Coin berilganligini belgilash (bir marta berish uchun)
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
