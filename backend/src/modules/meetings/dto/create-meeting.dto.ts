import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MeetingStatus } from '../schemas/meeting.schema';

export class CreateMeetingMeetingDto {
  @ApiProperty({ example: '6a43c96705f2b4f8e0656db1' })
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({ example: '2026-07-06T00:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '15:00' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: '6a43c96705f2b4f8e0656db2' })
  @IsString()
  @IsNotEmpty()
  teacher: string;

  @ApiProperty({ example: 'Room #102' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'Introduction' })
  @IsString()
  @IsNotEmpty()
  meetingType: string;

  @ApiProperty({ enum: MeetingStatus, example: MeetingStatus.SCHEDULED, required: false })
  @IsEnum(MeetingStatus)
  @IsOptional()
  status?: MeetingStatus;
}
