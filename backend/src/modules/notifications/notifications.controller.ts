import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { NotificationType } from '../../common/enums/status.enum';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('broadcast')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Broadcast a push notification to all students (Admin)' })
  @ApiResponse({ status: 201, description: 'Notification broadcasted successfully.' })
  broadcast(@Body() body: { title: string; message: string; data?: any }) {
    return this.notificationsService.broadcast(body.title, body.message, body.data);
  }

  @Post('send-push')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Send push notification to specific student or broadcast (Admin)' })
  sendPushNotification(@Body() body: { title: string; message: string; studentId?: string; data?: any }) {
    if (body.studentId) {
      return this.notificationsService.sendPushToSpecificUser(
        body.studentId,
        body.title,
        body.message,
        NotificationType.ANNOUNCEMENT,
        body.data
      );
    }
    return this.notificationsService.broadcast(body.title, body.message, body.data);
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
