import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RecoverPasswordDto {
  @ApiProperty({ example: 'muhammadazizyaqubov2@gmail.com', description: 'Email yoki telefon raqami' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: '5566', description: 'Maxfiy hint kaliti' })
  @IsNotEmpty()
  @IsString()
  hint: string;
}
