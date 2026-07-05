import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../../common/enums/roles.enum';
import { UserStatus } from '../../../common/enums/status.enum';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any).password;
      delete (ret as any).refreshToken;
      delete (ret as any).__v;
      return ret;
    },
  },
})
export class User extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop({ unique: true, sparse: true })
  studentPhone?: string;

  @Prop()
  parentPhone?: string;

  @Prop()
  dateOfBirth?: string;

  @Prop({ default: false })
  mustChangePassword?: boolean;

  @Prop({ required: true, select: false })
  password?: string;

  @Prop({ type: String, enum: Role, default: Role.STUDENT })
  role: Role;

  @Prop()
  avatar?: string;

  @Prop()
  label?: string;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Prop({ select: false })
  refreshToken?: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
