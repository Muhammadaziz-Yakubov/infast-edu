import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Chilonzor Filiali' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Toshkent' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: 'Chilonzor tumani' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Qatortol ko`chasi, 24-uy' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';

  // Branch Admin fields
  @ApiProperty({ example: 'Ali Valiyev' })
  @IsString()
  @IsNotEmpty()
  adminFullName: string;

  @ApiProperty({ example: 'ali@infast.uz' })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({ example: 'admin123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  adminPassword: string;
}
