import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRewardDto {
  @ApiProperty({ example: 'InFast Academy T-Shirt' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'High-quality cotton T-Shirt branded with InFast Academy logo.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://images.url/tshirt', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(1)
  coinPrice: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  stock: number;
}
