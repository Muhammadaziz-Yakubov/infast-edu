import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class SavePracticeDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  starterCode?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  validationRules?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  xpReward?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  coinReward?: number;
}

class SaveHomeworkDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  xpReward?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  coinReward?: number;
}

class SaveQuizQuestionDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty()
  @IsNumber()
  correctAnswerIndex: number;

  @ApiProperty()
  @IsNumber()
  round: number;
}

export class SaveMaterialsDto {
  @ApiProperty({ description: 'Dars ID si' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiPropertyOptional({ type: SavePracticeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SavePracticeDto)
  practice?: SavePracticeDto;

  @ApiPropertyOptional({ type: SaveHomeworkDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SaveHomeworkDto)
  homework?: SaveHomeworkDto;

  @ApiPropertyOptional({ type: [SaveQuizQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveQuizQuestionDto)
  quiz?: SaveQuizQuestionDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lessonSummary?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningObjectives?: string[];
}
