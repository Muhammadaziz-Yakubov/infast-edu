import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChatDto {
  @ApiProperty({ description: 'Yuborilayotgan xabar matni' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Chat ID si' })
  @IsString()
  @IsNotEmpty()
  chatId: string;
}
