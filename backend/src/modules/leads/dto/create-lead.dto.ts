import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LeadPriority, LeadStatus } from '../schemas/lead.schema';

class CustomFieldDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateLeadDto {
  @ApiProperty({ example: 'Sardor' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Alimov' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '+998933216547', required: false })
  @IsString()
  @IsOptional()
  secondPhone?: string;

  @ApiProperty({ example: '15.08.2005', required: false })
  @IsString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ example: 21, required: false })
  @IsNumber()
  @IsOptional()
  age?: number;

  @ApiProperty({ example: 'Male', required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  // Parent
  @ApiProperty({ example: 'Alisher Alimov', required: false })
  @IsString()
  @IsOptional()
  parentName?: string;

  @ApiProperty({ example: '+998998765432', required: false })
  @IsString()
  @IsOptional()
  parentPhone?: string;

  // Education
  @ApiProperty({ example: 'School #110', required: false })
  @IsString()
  @IsOptional()
  school?: string;

  @ApiProperty({ example: '11', required: false })
  @IsString()
  @IsOptional()
  grade?: string;

  // Address
  @ApiProperty({ example: 'Toshkent', required: false })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ example: 'Yunusobod', required: false })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ example: '12-daha, 12-uy', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  // Learning
  @ApiProperty({ example: '6a43c96705f2b4f8e0656db1', required: false })
  @IsString()
  @IsOptional()
  interestedCourse?: string;

  @ApiProperty({ example: '18:30 - 20:30', required: false })
  @IsString()
  @IsOptional()
  preferredTime?: string;

  // Marketing
  @ApiProperty({ example: '6a43c96705f2b4f8e0656db2', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: '6a43c96705f2b4f8e0656db3', required: false })
  @IsString()
  @IsOptional()
  campaign?: string;

  @ApiProperty({ example: 'Instagram post', required: false })
  @IsString()
  @IsOptional()
  advertisement?: string;

  @ApiProperty({ example: 'instagram', required: false })
  @IsString()
  @IsOptional()
  utmSource?: string;

  @ApiProperty({ example: 'cpc', required: false })
  @IsString()
  @IsOptional()
  utmMedium?: string;

  @ApiProperty({ example: 'summer_sale', required: false })
  @IsString()
  @IsOptional()
  utmCampaign?: string;

  // CRM
  @ApiProperty({ enum: LeadStatus, default: LeadStatus.NEW_LEAD, required: false })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty({ enum: LeadPriority, default: LeadPriority.MEDIUM, required: false })
  @IsEnum(LeadPriority)
  @IsOptional()
  priority?: LeadPriority;

  @ApiProperty({ example: '6a43c96705f2b4f8e0656db4', required: false })
  @IsString()
  @IsOptional()
  assignedManager?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  // Custom Fields
  @ApiProperty({ type: [CustomFieldDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  @IsOptional()
  customFields?: CustomFieldDto[];
}
