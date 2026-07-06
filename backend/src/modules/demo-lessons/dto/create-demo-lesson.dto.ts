import { IsString, IsNotEmpty, IsDateString, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DemoResult } from '../schemas/demo-lesson.schema';

export class CreateDemoLessonDto {
  @ApiProperty({ example: '6a43c96705f2b4f8e0656db1' })
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({ example: '6a43c96705f2b4f8e0656db2' })
  @IsString()
  @IsNotEmpty()
  course: string;

  @ApiProperty({ example: '6a43c96705f2b4f8e0656db3' })
  @IsString()
  @IsNotEmpty()
  group: string;

  @ApiProperty({ example: '2026-07-07T00:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  attendance: boolean;

  @ApiProperty({ example: 'Faol o\'quvchi, tushunishi yaxshi', required: false })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ enum: DemoResult, example: DemoResult.WILL_REGISTER, required: false })
  @IsEnum(DemoResult)
  @IsOptional()
  result?: DemoResult;
}
