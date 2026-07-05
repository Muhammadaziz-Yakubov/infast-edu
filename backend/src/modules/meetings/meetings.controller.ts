import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingMeetingDto } from './dto/create-meeting.dto';
import { MeetingStatus } from './schemas/meeting.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('meetings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.RECEPTION)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a new meeting' })
  @ApiResponse({ status: 201, description: 'Meeting scheduled successfully.' })
  create(@Body() dto: CreateMeetingMeetingDto, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.meetingsService.create(dto, user.userId, ip);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update scheduled meeting status (Completed, Cancelled, etc.)' })
  @ApiResponse({ status: 200, description: 'Meeting status updated.' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: MeetingStatus,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.meetingsService.updateStatus(id, status, user.userId, ip);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get all meetings for a specific lead' })
  @ApiResponse({ status: 200, description: 'Meetings list.' })
  findByLead(@Param('leadId') leadId: string) {
    return this.meetingsService.findByLead(leadId);
  }
}
