import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new event (Admin only)' })
  create(@Body() dto: any) {
    return this.eventsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events (Students and Admins)' })
  findAll(@CurrentUser() user: any) {
    // If request comes from an authenticated student, pass their userId to resolve registration status
    const userId = user?.role === Role.STUDENT ? user.userId : undefined;
    return this.eventsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event details by ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post(':id/register')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Register for an event (Student only)' })
  register(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.register(id, user.userId);
  }

  @Post(':id/unregister')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Unregister from an event (Student only)' })
  unregister(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.unregister(id, user.userId);
  }

  @Post(':id/attendance')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Submit attendance and apply coin adjustments (Admin only)' })
  submitAttendance(
    @Param('id') id: string,
    @Body('attendance') attendance: { userId: string; attended: boolean }[],
  ) {
    return this.eventsService.submitAttendance(id, attendance);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete an event (Admin only)' })
  delete(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }
}
