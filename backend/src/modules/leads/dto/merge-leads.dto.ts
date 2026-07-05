import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MergeLeadsDto {
  @ApiProperty({ example: '6a43c96705f2b4f8e0656db1' })
  @IsString()
  @IsNotEmpty()
  primaryLeadId: string;

  @ApiProperty({ example: '6a43c96705f2b4f8e0656db2' })
  @IsString()
  @IsNotEmpty()
  secondaryLeadId: string;
}
