import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskType } from '../schemas/homework.schema';
import { ApiProperty } from '@nestjs/swagger';

export class HomeworkTaskDto {
  @ApiProperty({ example: 'task_1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ enum: TaskType, example: TaskType.QUIZ })
  @IsEnum(TaskType)
  type: TaskType;

  @ApiProperty({ example: 'What is the correct syntax to reference an external script?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: ['<script src="xxx.js">', '<script href="xxx.js">', '<script name="xxx.js">'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiProperty({ example: '<script src="xxx.js">' })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;
}

export class CreateHomeworkDto {
  @ApiProperty({ example: 'Module 1 Final Homework' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Complete all questions on HTML structure.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d4' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ type: [HomeworkTaskDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomeworkTaskDto)
  tasks: HomeworkTaskDto[];

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  xpReward: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(0)
  coinReward: number;
}
