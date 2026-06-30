import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('broadcast')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Broadcast a notification to all students (Admin only)' })
  @ApiResponse({ status: 201, description: 'Notification broadcasted successfully.' })
  broadcast(@Body() body: { title: string; message: string }) {
    return this.notificationsService.broadcast(body.title, body.message);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiResponse({ status: 200, description: 'List of notifications.' })
  getOwnNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getNotifications(user.userId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read.' })
  markRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(user.userId, id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read.' })
  markAllRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }
}
