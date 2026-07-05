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
export class Activity extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: true, index: true })
  leadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; // The manager or admin performing the action

  @Prop({ required: true, type: Date, default: Date.now, index: true })
  timestamp: Date;

  @Prop({ required: true })
  action: string; // e.g. "STATUS_CHANGED", "CALL_LOGGED", "LEAD_CREATED"

  @Prop({ required: true })
  entity: string; // e.g. "Lead", "CallLog", "Meeting"

  @Prop()
  oldValue?: string;

  @Prop()
  newValue?: string;

  @Prop()
  ip?: string;
}

export type ActivityDocument = Activity & Document;
export const ActivitySchema = SchemaFactory.createForClass(Activity);
