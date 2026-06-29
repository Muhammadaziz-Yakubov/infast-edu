import { IsEnum, IsNotEmpty, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../common/enums/status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class MarkAttendanceDto {
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d5' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d6' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class AttendanceRecordDto {
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class BatchAttendanceDto {
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d5' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d6' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ example: '2026-06-29', required: false })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiProperty({ type: [AttendanceRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
