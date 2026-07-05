import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { FollowUpsService } from './follow-ups.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { FollowUpStatus } from './schemas/follow-up.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('follow-ups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.RECEPTION)
@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a manager follow-up for a lead' })
  @ApiResponse({ status: 201, description: 'Follow-up scheduled.' })
  create(@Body() dto: CreateFollowUpDto, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.followUpsService.create(dto, user.userId, ip);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update scheduled follow-up status (Completed, Cancelled, Pending)' })
  @ApiResponse({ status: 200, description: 'Follow-up status updated.' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: FollowUpStatus,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.followUpsService.updateStatus(id, status, user.userId, ip);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get all scheduled follow-ups for a specific lead' })
  @ApiResponse({ status: 200, description: 'Follow-ups list.' })
  findByLead(@Param('leadId') leadId: string) {
    return this.followUpsService.findByLead(leadId);
  }
}
