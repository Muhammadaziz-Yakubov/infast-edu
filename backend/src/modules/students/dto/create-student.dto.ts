import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'David Miller' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+998912345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, { message: 'Student phone number must match format +998XXXXXXXXX' })
  studentPhone: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  parentPhone: string;

  @ApiProperty({ example: '27.09.2011' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\.\d{2}\.\d{4}$/, { message: 'Date of birth must match DD.MM.YYYY format' })
  dateOfBirth: string;

  @ApiProperty({ example: 'david@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'https://avatar.url/david', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1', required: false })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d2', required: false })
  @IsString()
  @IsOptional()
  courseId?: string;
}
