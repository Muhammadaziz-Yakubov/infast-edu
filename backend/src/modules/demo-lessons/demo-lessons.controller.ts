import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DemoLessonsService } from './demo-lessons.service';
import { CreateDemoLessonDto } from './dto/create-demo-lesson.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('demo-lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.RECEPTION)
@Controller('demo-lessons')
export class DemoLessonsController {
  constructor(private readonly demoLessonsService: DemoLessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Log a lead demo lesson feedback' })
  @ApiResponse({ status: 201, description: 'Demo lesson logged successfully.' })
  create(@Body() dto: CreateDemoLessonDto, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.demoLessonsService.create(dto, user.userId, ip);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get all demo lesson records for a specific lead' })
  @ApiResponse({ status: 200, description: 'Demo lessons list.' })
  findByLead(@Param('leadId') leadId: string) {
    return this.demoLessonsService.findByLead(leadId);
  }
}
