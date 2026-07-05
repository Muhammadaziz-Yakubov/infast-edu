import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FollowUpStatus } from '../schemas/follow-up.schema';

export class CreateFollowUpDto {
  @ApiProperty({ example: '6a43c96705f2b4f8e0656db1' })
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({ example: '2026-07-07T00:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '12:30' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 'Tekshirib ko\'rish uchun' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ example: '6a43c96705f2b4f8e0656db2' })
  @IsString()
  @IsNotEmpty()
  assignedManager: string;

  @ApiProperty({ enum: FollowUpStatus, example: FollowUpStatus.PENDING, required: false })
  @IsEnum(FollowUpStatus)
  @IsOptional()
  status?: FollowUpStatus;
}
