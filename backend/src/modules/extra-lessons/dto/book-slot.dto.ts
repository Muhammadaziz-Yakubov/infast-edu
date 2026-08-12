import { IsString, IsNotEmpty } from 'class-validator';

export class BookSlotDto {
  @IsString()
  @IsNotEmpty()
  slotId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
