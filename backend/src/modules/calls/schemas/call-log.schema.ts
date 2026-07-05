import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CallResult {
  ANSWERED = 'ANSWERED',
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  BUSY = 'BUSY',
  NO_ANSWER = 'NO_ANSWER',
  WRONG_NUMBER = 'WRONG_NUMBER',
  CALL_BACK_LATER = 'CALL_BACK_LATER',
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).__v;
      return ret;
    },
  },
})
export class CallLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true, index: true })
  leadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  manager: Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  date: Date;

  @Prop({ required: true, type: Number })
  duration: number; // call duration in seconds

  @Prop({ required: true, type: String, enum: CallResult })
  result: CallResult;

  @Prop()
  notes?: string;
}

export type CallLogDocument = CallLog & Document;
export const CallLogSchema = SchemaFactory.createForClass(CallLog);
