import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestionDto {
  @ApiProperty({ example: 'What does HTML stand for?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: ['Hyper Text Markup Language', 'High Text Machine Language'] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ example: 0 })
  @IsNumber()
  correctAnswerIndex: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  round?: number;
}

export class PracticeTaskDto {
  @ApiProperty({ example: 'H1 element yarating' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'HTML code editor ichida h1 element yarating', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'html', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ example: '', required: false })
  @IsString()
  @IsOptional()
  starterCode?: string;

  @ApiProperty({ example: 'contains', required: false })
  @IsString()
  @IsOptional()
  validationType?: string;

  @ApiProperty({ example: ['<h1>'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  validationRules?: string[];

  @ApiProperty({ example: 50, required: false })
  @IsNumber()
  @IsOptional()
  xpReward?: number;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  coinReward?: number;
}

export class CreateLessonDto {
  @ApiProperty({ example: 'HTML Syntax & Basic Tags' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Learn about elements, tags, attributes, and simple page layout.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d3' })
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @ApiProperty({ type: PracticeTaskDto, required: false })
  @ValidateNested()
  @Type(() => PracticeTaskDto)
  @IsOptional()
  practice?: PracticeTaskDto;

  @ApiProperty({ type: [QuizQuestionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  @IsOptional()
  quiz?: QuizQuestionDto[];
}
