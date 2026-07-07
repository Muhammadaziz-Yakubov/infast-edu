import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus, PaymentStatus } from '../../../common/enums/status.enum';

export class UpdateStudentDto {
  @ApiProperty({ example: 'David Miller', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: '+998912345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '+998912345678', required: false })
  @IsString()
  @IsOptional()
  studentPhone?: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsString()
  @IsOptional()
  parentPhone?: string;

  @ApiProperty({ example: '27.09.2011', required: false })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  mustChangePassword?: boolean;

  @ApiProperty({ example: 'david@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'newpassword123', minLength: 6, required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'https://avatar.url/david-new', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ enum: UserStatus, required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1', required: false })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d2', required: false })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiProperty({ example: 1200, required: false })
  @IsNumber()
  @IsOptional()
  xp?: number;

  @ApiProperty({ example: 350, required: false })
  @IsNumber()
  @IsOptional()
  coins?: number;

  @ApiProperty({ example: 2, required: false })
  @IsNumber()
  @IsOptional()
  level?: number;

  @ApiProperty({ example: '2026-07-20', required: false })
  @IsString()
  @IsOptional()
  nextPaymentDate?: string;

  @ApiProperty({ example: 'Olimpiadachi', required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d3', required: false })
  @IsString()
  @IsOptional()
  branchId?: string;
}
