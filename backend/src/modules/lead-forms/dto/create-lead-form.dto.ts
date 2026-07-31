import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeadFormDto {
  @ApiProperty({ example: 'Instagram Yozgi Aksiya Formasi' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '66a1234567890abcdef12345', description: 'LeadSource ObjectId' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ example: 'InFast Academy IT kurslariga yoziling', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '66a1234567890abcdef12346', required: false, description: 'Course ObjectId' })
  @IsString()
  @IsOptional()
  interestedCourse?: string;
}
