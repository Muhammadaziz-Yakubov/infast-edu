import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({ example: 'Introduction to HTML' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d2', required: false })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d3', required: false })
  @IsString()
  @IsOptional()
  groupId?: string;
}
