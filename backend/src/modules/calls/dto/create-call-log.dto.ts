import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CallResult } from '../schemas/call-log.schema';

export class CreateCallLogDto {
  @ApiProperty({ example: '6a43c96705f2b4f8e0656db1' })
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({ example: 45 })
  @IsNumber()
  duration: number; // in seconds

  @ApiProperty({ enum: CallResult, example: CallResult.INTERESTED })
  @IsEnum(CallResult)
  result: CallResult;

  @ApiProperty({ example: 'Mijoz qiziqdi, ertaga bog\'lanamiz', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
