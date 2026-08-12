import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSlotDto {
  @IsString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  startTime: string; // e.g. "16:00"

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
