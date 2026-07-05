import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttachmentType } from '../schemas/attachment.schema';

export class CreateAttachmentDto {
  @ApiProperty({ example: '6a43c96705f2b4f8e0656db1' })
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({ example: 'passport_scan.pdf' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://storage.googleapis.com/infast-lms/uploads/12345.pdf' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ enum: AttachmentType, example: AttachmentType.PASSPORT })
  @IsEnum(AttachmentType)
  type: AttachmentType;
}
