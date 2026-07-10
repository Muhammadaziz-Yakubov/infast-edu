import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiChat, AiChatDocument } from './schemas/ai-chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(AiChat.name)
    private readonly aiChatModel: Model<AiChatDocument>,
  ) {}

  async createChat(dto: {
    teacherId: string;
    groupId?: string;
    courseId?: string;
    moduleId?: string;
    lessonId?: string;
    difficulty?: string;
    language?: string;
    quickActions?: string[];
  }): Promise<AiChatDocument> {
    const newChat = new this.aiChatModel({
      teacherId: new Types.ObjectId(dto.teacherId),
      groupId: dto.groupId ? new Types.ObjectId(dto.groupId) : undefined,
      courseId: dto.courseId ? new Types.ObjectId(dto.courseId) : undefined,
      moduleId: dto.moduleId ? new Types.ObjectId(dto.moduleId) : undefined,
      lessonId: dto.lessonId ? new Types.ObjectId(dto.lessonId) : undefined,
      difficulty: dto.difficulty,
      language: dto.language,
      quickActions: dto.quickActions,
      messages: [],
    });
    return newChat.save();
  }

  async addMessage(
    chatId: string,
    teacherId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
  ): Promise<AiChatDocument> {
    const chat = await this.aiChatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat topilmadi');
    }
    if (chat.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bu chatga ruxsat yo\'q');
    }

    chat.messages.push({
      role,
      content,
      timestamp: new Date(),
    });

    return chat.save();
  }

  async getHistory(teacherId: string): Promise<AiChatDocument[]> {
    return this.aiChatModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .populate('groupId', 'name')
      .populate('courseId', 'title')
      .populate('moduleId', 'title')
      .populate('lessonId', 'title')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getChat(chatId: string, teacherId: string): Promise<AiChatDocument> {
    const chat = await this.aiChatModel
      .findById(chatId)
      .populate('groupId', 'name')
      .populate('courseId', 'title')
      .populate('moduleId', 'title')
      .populate('lessonId', 'title')
      .exec();

    if (!chat) {
      throw new NotFoundException('Chat topilmadi');
    }
    if (chat.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bu chatga ruxsat yo\'q');
    }
    return chat;
  }

  async deleteChat(chatId: string, teacherId: string): Promise<any> {
    const chat = await this.aiChatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat topilmadi');
    }
    if (chat.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Bu chatga ruxsat yo\'q');
    }

    await this.aiChatModel.findByIdAndDelete(chatId);
    return { success: true };
  }
}
