import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CourseStatus } from '../../../common/enums/status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Frontend Development' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Learn HTML, CSS, JavaScript, and React from scratch.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://thumbnail.url/frontend', required: false })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '6 months' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ example: 114, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalLessons?: number;

  @ApiProperty({ example: 'Beginner' })
  @IsString()
  @IsNotEmpty()
  level: string;

  @ApiProperty({ enum: CourseStatus, required: false, default: CourseStatus.DRAFT })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;
}
