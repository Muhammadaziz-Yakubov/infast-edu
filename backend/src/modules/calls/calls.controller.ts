import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('calls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.RECEPTION)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post()
  @ApiOperation({ summary: 'Log a lead phone call' })
  @ApiResponse({ status: 201, description: 'Call logged successfully.' })
  create(@Body() dto: CreateCallLogDto, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.callsService.create(dto, user.userId, ip);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get all call logs for a specific lead' })
  @ApiResponse({ status: 200, description: 'Call logs list.' })
  findByLead(@Param('leadId') leadId: string) {
    return this.callsService.findByLead(leadId);
  }
}
