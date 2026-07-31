import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitLeadFormDto {
  @ApiProperty({ example: 'Sherzod' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Karimov' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 22 })
  @IsNumber()
  @IsNotEmpty()
  age: number;

  @ApiProperty({ example: '66a1234567890abcdef12346', required: false })
  @IsString()
  @IsOptional()
  interestedCourse?: string;
}
