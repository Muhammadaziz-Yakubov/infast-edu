import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StudentAnswerDto {
  @ApiProperty({ example: 'task_1' })
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({ example: '<script src="xxx.js">' })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class SubmitHomeworkDto {
  @ApiProperty({ type: [StudentAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAnswerDto)
  answers: StudentAnswerDto[];
}
