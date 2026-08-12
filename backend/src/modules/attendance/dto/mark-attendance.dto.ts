import { IsEnum, IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
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

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d6', required: false })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  lessonNumber?: number;

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

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d6', required: false })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  lessonNumber?: number;

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

export class GeofencedCheckInDto {
  @ApiProperty({ example: 41.311081 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: 69.240562 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isMocked?: boolean;
}

export class UpdateAcademyConfigDto {
  @ApiProperty({ example: 41.311081 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: 69.240562 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @IsNotEmpty()
  radiusMeters: number;
}
