import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** Get all rooms for current user */
  @Get('rooms')
  @ApiOperation({ summary: 'Get all chat rooms for the current user' })
  async getMyRooms(@CurrentUser() user: any) {
    if (user.role === 'SUPER_ADMIN') {
      return this.chatService.getAllRooms(user.userId);
    }
    return this.chatService.getRoomsForUser(user.userId);
  }

  /** Get messages in a room */
  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Get message history for a chat room' })
  async getMessages(
    @Param('roomId') roomId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.chatService.getMessages(roomId, limit ? parseInt(limit) : 50, before);
  }

  /** Admin sends a message via REST (also broadcasts via WS) */
  @Post('rooms/:roomId/messages')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin sends a message to a room (REST + WebSocket broadcast)' })
  async adminSendMessage(
    @Param('roomId') roomId: string,
    @Body('text') text: string,
    @CurrentUser() user: any,
  ) {
    const adminUser = await this.userModel.findById(user.userId).exec();
    const message = await this.chatService.saveMessage(
      roomId,
      user.userId,
      adminUser?.fullName || 'Administrator',
      adminUser?.avatar || null,
      text,
    );
    // Broadcast via WebSocket too
    this.chatGateway.emitToRoom(roomId, message);
    return message;
  }

  /** Admin opens/creates a direct room with a student */
  @Post('direct/:studentId')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin creates or gets a direct chat room with a student' })
  async getOrCreateDirect(
    @Param('studentId') studentId: string,
    @CurrentUser() user: any,
  ) {
    const student = await this.userModel.findById(studentId).exec();
    if (!student) throw new Error('Student not found');
    return this.chatService.getOrCreateDirectRoom(user.userId, studentId, student.fullName);
  }

  /** Get or create student's direct room with admin */
  @Post('admin-room')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Student gets or creates their direct chat with admin' })
  async getStudentAdminRoom(@CurrentUser() user: any) {
    // Find admin user
    const admin = await this.userModel.findOne({ role: Role.SUPER_ADMIN }).exec();
    if (!admin) throw new Error('No admin found');
    const studentUser = await this.userModel.findById(user.userId).exec();
    return this.chatService.getOrCreateDirectRoom(
      admin._id.toString(),
      user.userId,
      studentUser?.fullName || 'Student',
    );
  }

  /** Mark room as read */
  @Post('rooms/:roomId/read')
  @ApiOperation({ summary: 'Mark all messages in a room as read' })
  async markRead(@Param('roomId') roomId: string, @CurrentUser() user: any) {
    await this.chatService.markRead(roomId, user.userId);
    return { success: true };
  }
}
