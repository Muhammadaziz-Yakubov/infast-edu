import { IsArray, IsDateString, IsNotEmpty, IsObject, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GroupScheduleDto {
  @ApiProperty({ example: ['Tuesday', 'Thursday', 'Saturday'] })
  @IsArray()
  @IsString({ each: true })
  days: string[];

  @ApiProperty({ example: '18:30 - 20:00' })
  @IsString()
  @IsNotEmpty()
  time: string;
}

export class CreateGroupDto {
  @ApiProperty({ example: 'Frontend Beginner #1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d2' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ type: GroupScheduleDto })
  @IsObject()
  @ValidateNested()
  @Type(() => GroupScheduleDto)
  schedule: GroupScheduleDto;

  @ApiProperty({ example: '2026-01-14T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-14T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
