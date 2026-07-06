import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).__v;
      return ret;
    },
  },
})
export class TelegramBotLog extends Document {
  @Prop({ required: true })
  telegramId: string;

  @Prop()
  username?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  messageText?: string;

  @Prop()
  command?: string;

  @Prop()
  action?: string; // Callback query data or sub-action
}

export type TelegramBotLogDocument = TelegramBotLog & Document;
export const TelegramBotLogSchema = SchemaFactory.createForClass(TelegramBotLog);
TelegramBotLogSchema.index({ telegramId: 1, createdAt: -1 });
