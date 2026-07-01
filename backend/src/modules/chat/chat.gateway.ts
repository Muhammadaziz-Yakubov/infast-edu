import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map of socketId → userId
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // ─── Connection ─────────────────────────────────────────────────────────────

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET') || 'infast_academy_os_jwt_secret_key_2026',
      });

      const userId = payload.userId || payload.sub;
      if (!userId) {
        socket.disconnect();
        return;
      }

      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        socket.disconnect();
        return;
      }

      this.connectedUsers.set(socket.id, userId);

      // Join personal room for user-specific real-time notifications
      socket.join(`user:${userId}`);

      // Auto-join all rooms this user is in
      const rooms = await this.chatService.getRoomsForUser(userId);
      for (const room of rooms) {
        socket.join(`room:${room._id}`);
      }

      // Admins also join a special admin room
      if (user.role === 'SUPER_ADMIN') {
        socket.join('admin');
      }

      socket.emit('connected', { userId });
    } catch (e) {
      console.error('[ChatGateway] Connection error:', e.message);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.connectedUsers.delete(socket.id);
  }

  // ─── Events ─────────────────────────────────────────────────────────────────

  /** Client joins a specific chat room */
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    socket.join(`room:${data.roomId}`);
    socket.emit('joined', { roomId: data.roomId });
  }

  /** Client sends a message */
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; text: string },
  ) {
    const userId = this.connectedUsers.get(socket.id);
    if (!userId || !data.text?.trim()) return;

    const user = await this.userModel.findById(userId).exec();
    if (!user) return;

    const message = await this.chatService.saveMessage(
      data.roomId,
      userId,
      user.fullName,
      user.avatar || null,
      data.text.trim(),
    );

    // Fetch the room to find all participants and send directly to their personal channels
    const room = await this.chatService.getRoom(data.roomId);
    if (room) {
      for (const p of room.participants) {
        const pId = p.toString();
        this.server.to(`user:${pId}`).emit('new-message', message);
        this.server.to(`user:${pId}`).emit('room-updated', {
          roomId: data.roomId,
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
          senderId: userId,
          senderName: user.fullName,
        });
      }
    } else {
      // Fallback
      this.server.to(`room:${data.roomId}`).emit('new-message', message);
    }
  }

  /** Mark messages as read */
  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = this.connectedUsers.get(socket.id);
    if (!userId) return;
    await this.chatService.markRead(data.roomId, userId);
    socket.emit('marked-read', { roomId: data.roomId });
  }

  /** Utility: emit new-message from outside (e.g., system/admin REST send) */
  async emitToRoom(roomId: string, message: any) {
    const room = await this.chatService.getRoom(roomId);
    if (room) {
      for (const p of room.participants) {
        const pId = p.toString();
        this.server.to(`user:${pId}`).emit('new-message', message);
        this.server.to(`user:${pId}`).emit('room-updated', {
          roomId,
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
          senderId: message.senderId,
          senderName: message.senderName,
        });
      }
    } else {
      this.server.to(`room:${roomId}`).emit('new-message', message);
    }
  }
}
