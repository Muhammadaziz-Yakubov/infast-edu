import { IsString, IsEnum, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CustomFieldType } from '../schemas/custom-field-definition.schema';

export class CreateCustomFieldDefinitionDto {
  @ApiProperty({ example: 'github_username' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'GitHub Username' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ enum: CustomFieldType, example: CustomFieldType.TEXT })
  @IsEnum(CustomFieldType)
  type: CustomFieldType;

  @ApiProperty({ type: [String], required: false, example: ['Option 1', 'Option 2'] })
  @IsArray()
  @IsOptional()
  options?: string[];
}
