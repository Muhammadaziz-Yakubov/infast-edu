import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeadSourceDto {
  @ApiProperty({ example: 'Instagram' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
