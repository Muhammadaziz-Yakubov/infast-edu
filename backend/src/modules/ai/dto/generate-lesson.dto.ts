import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class GenerateLessonDto {
  @ApiPropertyOptional({ description: 'Guruh ID si' })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Kurs ID si' })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Modul ID si' })
  @IsString()
  @IsOptional()
  moduleId?: string;

  @ApiPropertyOptional({ description: 'Dars ID si' })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiPropertyOptional({ description: 'Qiyinchilik darajasi (Easy, Medium, Hard)', default: 'Medium' })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Til (Uzbek, English)', default: 'Uzbek' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ description: 'O\'qituvchi tomonidan kiritilgan dars tafsilotlari/mavzusi' })
  @IsString()
  @IsNotEmpty()
  topicDescription: string;

  @ApiProperty({ description: 'Generatsiya qilinadigan materiallar ro\'yxati (Practice, Homework, Quiz, Lesson Summary, Learning Objectives)', type: [String] })
  @IsArray()
  @IsString({ each: true })
  quickActions: string[];

  @ApiPropertyOptional({ description: 'Mavjud chat tarixi ID si' })
  @IsString()
  @IsOptional()
  chatId?: string;
}
