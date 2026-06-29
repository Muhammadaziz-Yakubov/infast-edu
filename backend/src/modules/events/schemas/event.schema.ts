import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  image: string; // Afisha / Poster URL

  // List of student User IDs who registered for the event
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  participants: Types.ObjectId[];

  // Attendance tracking
  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        attended: { type: Boolean, default: false },
        processed: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  attendance: {
    userId: Types.ObjectId;
    attended: boolean;
    processed: boolean;
  }[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
