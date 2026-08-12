import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'academy_config', timestamps: true })
export class AcademyConfig extends Document {
  @Prop({ default: 40.627311513952975 })
  latitude: number;

  @Prop({ default: 72.51471206409424 })
  longitude: number;

  @Prop({ default: 100 })
  radiusMeters: number;

  // Singleton key — always one record
  @Prop({ default: 'main', unique: true })
  key: string;
}

export type AcademyConfigDocument = AcademyConfig & Document;
export const AcademyConfigSchema = SchemaFactory.createForClass(AcademyConfig);
