import { IsString, IsNotEmpty, IsDateString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../schemas/task.schema';

export class CreateTaskDto {
  @ApiProperty({ example: '6a43c96705f2b4f8e0656db1' })
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({ example: 'Telefon qilish' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Ota-onasi bilan kurs narxini kelishish', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-07-06T18:00:00.000Z' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.MEDIUM, required: false })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.PENDING, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  reminder?: boolean;
}
