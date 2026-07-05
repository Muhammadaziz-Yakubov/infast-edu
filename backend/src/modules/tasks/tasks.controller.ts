import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './schemas/task.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.RECEPTION)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a manager task for a lead' })
  @ApiResponse({ status: 201, description: 'Task created.' })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.tasksService.create(dto, user.userId, ip);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update manager task status (Completed, Cancelled, Pending)' })
  @ApiResponse({ status: 200, description: 'Task status updated.' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.tasksService.updateStatus(id, status, user.userId, ip);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get all tasks for a specific lead' })
  @ApiResponse({ status: 200, description: 'Tasks list.' })
  findByLead(@Param('leadId') leadId: string) {
    return this.tasksService.findByLead(leadId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete manager task' })
  @ApiResponse({ status: 200, description: 'Task deleted.' })
  remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.tasksService.remove(id, user.userId, ip);
  }
}
