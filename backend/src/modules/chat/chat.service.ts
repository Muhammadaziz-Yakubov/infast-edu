import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom, ChatRoomDocument } from './schemas/chat-room.schema';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { StudentProfile } from '../students/schemas/student-profile.schema';
import { Group } from '../groups/schemas/group.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name) private readonly roomModel: Model<ChatRoomDocument>,
    @InjectModel(ChatMessage.name) private readonly messageModel: Model<ChatMessageDocument>,
    @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<any>,
    @InjectModel(Group.name) private readonly groupModel: Model<any>,
    @InjectModel(User.name) private readonly userModel: Model<any>,
  ) {}

  // ─── Room Management ────────────────────────────────────────────────────────

  /** Create a GROUP room for a newly created group */
  async createGroupRoom(groupId: string, groupName: string, participantIds: string[]): Promise<ChatRoomDocument> {
    const existing = await this.roomModel.findOne({ groupId: new Types.ObjectId(groupId) }).exec();
    if (existing) return existing;

    const room = new this.roomModel({
      name: groupName,
      type: 'GROUP',
      groupId: new Types.ObjectId(groupId),
      participants: participantIds.map((id) => new Types.ObjectId(id)),
    });
    return room.save();
  }

  /** Get or create a DIRECT room between admin and a student */
  async getOrCreateDirectRoom(adminId: string, studentId: string, studentName: string): Promise<ChatRoomDocument> {
    const adminOid = new Types.ObjectId(adminId);
    const studentOid = new Types.ObjectId(studentId);

    const existing = await this.roomModel.findOne({
      type: 'DIRECT',
      participants: { $all: [adminOid, studentOid], $size: 2 },
    }).exec();
    if (existing) return existing;

    const room = new this.roomModel({
      name: studentName,
      type: 'DIRECT',
      participants: [adminOid, studentOid],
    });
    return room.save();
  }

  /** Get a room by its ID */
  async getRoom(roomId: string): Promise<ChatRoomDocument | null> {
    return this.roomModel.findById(roomId).exec();
  }

  /** Add a user to a group chat room */
  async addParticipant(groupId: string, userId: string): Promise<void> {
    await this.roomModel.findOneAndUpdate(
      { groupId: new Types.ObjectId(groupId), type: 'GROUP' },
      { $addToSet: { participants: new Types.ObjectId(userId) } },
    ).exec();
  }

  /** Remove a user from a group chat room */
  async removeParticipant(groupId: string, userId: string): Promise<void> {
    await this.roomModel.findOneAndUpdate(
      { groupId: new Types.ObjectId(groupId), type: 'GROUP' },
      { $pull: { participants: new Types.ObjectId(userId) } },
    ).exec();
  }

  // ─── Rooms for a User ───────────────────────────────────────────────────────

  /** Get all chat rooms a user is in */
  async getRoomsForUser(userId: string): Promise<any[]> {
    // Self-healing: Ensure group chat exists and student is a participant if they have a groupId
    try {
      const studentProfile = await this.studentProfileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
      if (studentProfile && studentProfile.groupId) {
        const groupId = studentProfile.groupId.toString();
        let groupRoom: any = await this.roomModel.findOne({ groupId: new Types.ObjectId(groupId), type: 'GROUP' }).exec();
        if (!groupRoom) {
          const group = await this.groupModel.findById(groupId).exec();
          if (group) {
            const participantIds = group.students ? group.students.map((sId: any) => sId.toString()) : [];
            if (!participantIds.includes(userId)) {
              participantIds.push(userId);
            }
            groupRoom = await this.createGroupRoom(groupId, group.name, participantIds);
          }
        } else {
          const isParticipant = groupRoom.participants.some((p: any) => p.toString() === userId);
          if (!isParticipant) {
            await this.roomModel.findByIdAndUpdate(groupRoom._id, {
              $addToSet: { participants: new Types.ObjectId(userId) },
            }).exec();
          }
        }
      }
    } catch (e) {
      console.error('[ChatService] Self-healing group room check failed:', e.message);
    }

    const rooms = await this.roomModel
      .find({ participants: new Types.ObjectId(userId) })
      .sort({ lastMessageAt: -1 })
      .exec();

    const formattedRooms = [];
    for (const r of rooms) {
      const unreadCount = await this.getUnreadCount(r._id.toString(), userId);
      
      let displayName = r.name;
      if (r.type === 'DIRECT') {
        const otherParticipantId = r.participants.find((p: any) => p.toString() !== userId);
        if (otherParticipantId) {
          const otherUser = await this.userModel.findById(otherParticipantId).exec();
          if (otherUser) {
            displayName = otherUser.fullName;
          }
        }
      }

      formattedRooms.push({
        _id: r._id.toString(),
        name: displayName,
        type: r.type,
        groupId: r.groupId?.toString() || null,
        avatar: r.avatar || null,
        lastMessage: r.lastMessage || null,
        lastMessageAt: r.lastMessageAt || null,
        unreadCount,
        participantCount: r.participants.length,
      });
    }

    return formattedRooms;
  }

  /** Get all rooms (for admin — all chats) */
  async getAllRooms(adminId?: string): Promise<any[]> {
    const rooms = await this.roomModel
      .find()
      .sort({ lastMessageAt: -1 })
      .exec();

    const formattedRooms = [];
    for (const r of rooms) {
      const unreadCount = adminId ? await this.getUnreadCount(r._id.toString(), adminId) : 0;
      
      let displayName = r.name;
      if (r.type === 'DIRECT' && adminId) {
        const otherParticipantId = r.participants.find((p: any) => p.toString() !== adminId);
        if (otherParticipantId) {
          const otherUser = await this.userModel.findById(otherParticipantId).exec();
          if (otherUser) {
            displayName = otherUser.fullName;
          }
        }
      }

      formattedRooms.push({
        _id: r._id.toString(),
        name: displayName,
        type: r.type,
        groupId: r.groupId?.toString() || null,
        avatar: r.avatar || null,
        lastMessage: r.lastMessage || null,
        lastSenderId: r.lastSenderId?.toString() || null,
        lastMessageAt: r.lastMessageAt || null,
        unreadCount,
        participantCount: r.participants.length,
      });
    }

    return formattedRooms;
  }

  // ─── Messages ───────────────────────────────────────────────────────────────

  /** Save a message and update room's last message */
  async saveMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string | null,
    text: string,
  ): Promise<any> {
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) throw new NotFoundException('Chat room not found');

    // Verify sender is a participant
    const isParticipant = room.participants.some((p) => p.toString() === senderId);
    if (!isParticipant) {
      // Auto-add admin if not participant (admin can message anywhere)
      await this.roomModel.findByIdAndUpdate(roomId, {
        $addToSet: { participants: new Types.ObjectId(senderId) },
      }).exec();
    }

    const msg = new this.messageModel({
      roomId: new Types.ObjectId(roomId),
      senderId: new Types.ObjectId(senderId),
      senderName,
      senderAvatar,
      text,
      readBy: [new Types.ObjectId(senderId)],
    });
    const saved = await msg.save();

    // Update room's last message preview
    await this.roomModel.findByIdAndUpdate(roomId, {
      lastMessage: text.length > 60 ? text.substring(0, 60) + '...' : text,
      lastSenderId: new Types.ObjectId(senderId),
      lastMessageAt: new Date(),
    }).exec();

    return {
      _id: saved._id.toString(),
      roomId,
      senderId,
      senderName,
      senderAvatar,
      text,
      createdAt: (saved as any).createdAt,
      readBy: [senderId],
    };
  }

  /** Get messages for a room (paginated) */
  async getMessages(roomId: string, limit = 50, before?: string): Promise<any[]> {
    const query: any = { roomId: new Types.ObjectId(roomId) };
    if (before) {
      query._id = { $lt: new Types.ObjectId(before) };
    }

    const messages = await this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return messages.reverse().map((m) => ({
      _id: m._id.toString(),
      roomId: m.roomId.toString(),
      senderId: m.senderId.toString(),
      senderName: m.senderName,
      senderAvatar: m.senderAvatar || null,
      text: m.text,
      createdAt: (m as any).createdAt,
      readBy: m.readBy.map((id) => id.toString()),
    }));
  }

  /** Mark messages as read */
  async markRead(roomId: string, userId: string): Promise<void> {
    await this.messageModel.updateMany(
      { roomId: new Types.ObjectId(roomId), readBy: { $ne: new Types.ObjectId(userId) } },
      { $addToSet: { readBy: new Types.ObjectId(userId) } },
    ).exec();
  }

  /** Count unread messages for a user in a room */
  async getUnreadCount(roomId: string, userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      roomId: new Types.ObjectId(roomId),
      readBy: { $ne: new Types.ObjectId(userId) },
    }).exec();
  }
}
