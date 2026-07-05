import { Controller, Get, UseGuards } from '@nestjs/common';
import { AiAdvisorService } from './ai-advisor.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('ai-advisor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiAdvisorController {
  constructor(private readonly aiAdvisorService: AiAdvisorService) {}

  @Get('dashboard')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get AI Advisor Dashboard insights and recommendations' })
  @ApiResponse({ status: 200, description: 'Advisor insights structured JSON.' })
  async getDashboard() {
    const data = await this.aiAdvisorService.getDashboardInsights();
    return {
      success: true,
      data,
    };
  }
}
