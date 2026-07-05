import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { MergeLeadsDto } from './dto/merge-leads.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.RECEPTION)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new lead with duplicate checking and auto assignment' })
  @ApiResponse({ status: 201, description: 'Lead created.' })
  create(
    @Body() dto: CreateLeadDto,
    @CurrentUser() user: any,
    @Req() req: any,
    @Query('strategy') strategy?: 'ROUND_ROBIN' | 'LEAST_BUSY',
  ) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.leadsService.create(dto, user.userId, ip, strategy);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active leads (paginated, sorted, filtered)' })
  @ApiResponse({ status: 200, description: 'Leads list page.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('courseId') courseId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('sourceId') sourceId?: string,
    @Query('isArchived') isArchived?: boolean,
    @Query('hasMeeting') hasMeeting?: boolean,
    @Query('hasDemo') hasDemo?: boolean,
    @Query('hasFollowUp') hasFollowUp?: boolean,
  ) {
    return this.leadsService.findAll({
      page, limit, search, sort, order, status, priority, courseId, campaignId, sourceId, isArchived, hasMeeting, hasDemo, hasFollowUp
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single lead details' })
  @ApiResponse({ status: 200, description: 'Lead details.' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lead details (validated pipeline)' })
  @ApiResponse({ status: 200, description: 'Lead updated.' })
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.leadsService.update(id, dto, user.userId, ip);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge secondary duplicate lead into primary lead' })
  @ApiResponse({ status: 200, description: 'Leads merged.' })
  merge(@Body() dto: MergeLeadsDto, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.leadsService.merge(dto.primaryLeadId, dto.secondaryLeadId, user.userId, ip);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a lead' })
  @ApiResponse({ status: 200, description: 'Lead archived.' })
  archive(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.leadsService.archive(id, user.userId, ip);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore an archived lead' })
  @ApiResponse({ status: 200, description: 'Lead restored.' })
  restore(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.leadsService.restore(id, user.userId, ip);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted.' })
  remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.leadsService.remove(id, user.userId, ip);
  }
}
