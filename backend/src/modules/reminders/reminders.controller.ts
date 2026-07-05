import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.RECEPTION)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active alerts/reminders' })
  @ApiResponse({ status: 200, description: 'Reminders list.' })
  findAll() {
    return this.remindersService.findAll();
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get active alerts/reminders for a specific lead' })
  @ApiResponse({ status: 200, description: 'Lead reminders list.' })
  findByLead(@Param('leadId') leadId: string) {
    return this.remindersService.findByLead(leadId);
  }
}
