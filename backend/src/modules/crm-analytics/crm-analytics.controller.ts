import { Controller, Get, UseGuards } from '@nestjs/common';
import { CrmAnalyticsService } from './crm-analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('crm-analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER)
@Controller('crm-analytics')
export class CrmAnalyticsController {
  constructor(private readonly analyticsService: CrmAnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get CRM dashboard performance metric widgets (CAC, CLV, LVR counts)' })
  @ApiResponse({ status: 200, description: 'Dashboard widgets.' })
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Get sales pipeline funnel drop-off stats' })
  @ApiResponse({ status: 200, description: 'Funnel stages count.' })
  getFunnelDropoff() {
    return this.analyticsService.getFunnelDropoff();
  }

  @Get('lost-reasons')
  @ApiOperation({ summary: 'Get lost reasons distribution breakdown' })
  @ApiResponse({ status: 200, description: 'Lost reasons list.' })
  getLostReasons() {
    return this.analyticsService.getLostReasons();
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get course conversion metrics' })
  @ApiResponse({ status: 200, description: 'Course metrics.' })
  getCourseAnalytics() {
    return this.analyticsService.getCourseAnalytics();
  }

  @Get('managers')
  @ApiOperation({ summary: 'Get sales managers performance KPIs' })
  @ApiResponse({ status: 200, description: 'Managers metrics.' })
  getManagersPerformance() {
    return this.analyticsService.getManagersPerformance();
  }
}
