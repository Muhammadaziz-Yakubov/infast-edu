import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'tx_987654321', required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ example: 'Click', required: false })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ example: 'Super Admin', required: false })
  @IsString()
  @IsOptional()
  createdBy?: string;
}
