import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestionDto {
  @ApiProperty({ example: 'What does HTML stand for?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: ['Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Tabular Mark Language'] })
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

export class CreateLessonDto {
  @ApiProperty({ example: 'HTML Syntax & Basic Tags' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Learn about elements, tags, attributes, and simple page layout.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', required: false })
  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'videoUrl must be a valid URL' })
  videoUrl?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d3' })
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @ApiProperty({ example: 'HTML elements are the building blocks of web pages...', required: false })
  @IsString()
  @IsOptional()
  textContent?: string;

  @ApiProperty({ example: ['Create an index.html file', 'Add a header and paragraph'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  practiceTasks?: string[];

  @ApiProperty({ type: [QuizQuestionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  @IsOptional()
  quiz?: QuizQuestionDto[];
}
