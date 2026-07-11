import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateContractDto {
  @ApiProperty({ example: 'Toshkent sh., Chilonzor tumani', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'AA1234567', required: false })
  @IsString()
  @IsOptional()
  passportOrJshshir?: string;

  @ApiProperty({ example: 'John Doe Sr.', required: false })
  @IsString()
  @IsOptional()
  parentName?: string;

  @ApiProperty({ example: '+998901112233', required: false })
  @IsString()
  @IsOptional()
  parentPhone?: string;

  @ApiProperty({ example: 600000, required: false })
  @IsNumber()
  @IsOptional()
  monthlyPayment?: number;

  @ApiProperty({ example: '2026-07-11', required: false })
  @IsString()
  @IsOptional()
  contractDate?: string;
}
