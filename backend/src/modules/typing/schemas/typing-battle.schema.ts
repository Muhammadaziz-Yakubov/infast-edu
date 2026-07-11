import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TypingBattleDocument = TypingBattle & Document;

@Schema({ timestamps: true })
export class TypingBattle {
  @Prop({ type: Types.ObjectId, ref: 'StudentProfile', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StudentProfile', required: true })
  opponentId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  wpm: number;

  @Prop({ required: true })
  accuracy: number;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true, enum: ['WIN', 'LOSE', 'DRAW'] })
  result: 'WIN' | 'LOSE' | 'DRAW';

  @Prop({ required: true })
  xpChange: number;
}

export const TypingBattleSchema = SchemaFactory.createForClass(TypingBattle);
