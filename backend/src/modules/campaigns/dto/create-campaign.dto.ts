import { IsString, IsNotEmpty, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatus } from '../schemas/campaign.schema';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Promo 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Facebook Ads' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  budget: number;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-08-31T00:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: CampaignStatus, example: CampaignStatus.ACTIVE })
  @IsEnum(CampaignStatus)
  status: CampaignStatus;
}
