import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsString()
  @IsNotEmpty()
  identifier: string; // Can be email or phone number

  @ApiProperty({ example: 'studentpassword' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
