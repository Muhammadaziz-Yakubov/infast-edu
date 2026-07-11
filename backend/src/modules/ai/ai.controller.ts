import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LessonGeneratorService } from './lesson-generator.service';
import { ChatService } from './chat.service';
import { GenerateLessonDto } from './dto/generate-lesson.dto';
import { ChatDto } from './dto/chat.dto';
import { SaveMaterialsDto } from './dto/save-materials.dto';
import type { Response } from 'express';
import { GroqService } from './groq.service';

@ApiTags('AI Lesson Creator')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly lessonGeneratorService: LessonGeneratorService,
    private readonly chatService: ChatService,
    private readonly groqService: GroqService,
  ) {}

  @ApiOperation({ summary: 'Mavzu bo\'yicha dars materiallarini generatsiya qilish (Streaming)' })
  @Post('generate-lesson')
  async generateLesson(
    @Body() dto: GenerateLessonDto,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const teacherId = req.user.userId;
    await this.lessonGeneratorService.generateLesson(
      {
        ...dto,
        teacherId,
      },
      res,
    );
  }

  @ApiOperation({ summary: 'Mavjud chat tarixi bo\'yicha davomiy muloqot (Streaming)' })
  @Post('chat')
  async chat(
    @Body() dto: ChatDto,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const teacherId = req.user.userId;

    // 1. Add user message to DB
    await this.chatService.addMessage(dto.chatId, teacherId, 'user', dto.message);

    // 2. Fetch full conversation history
    const chat = await this.chatService.getChat(dto.chatId, teacherId);

    // 3. Build system instruction
    const systemPrompt = `Siz InFast IT-Academy AI Lesson Creator yordamchisisiz. Oldingi suhbatni davom ettiring va o'qituvchi so'ragan mavzuda yordam bering.
Foydalanuvchi so'ragan mavzuni tushuntiring, materiallarni o'zgartiring yoki savollar qo'shing. Agar foydalanuvchi materiallarni to'liq generatsiya qilishni so'rasa, yangilangan materiallarni bering.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chat.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // 4. Stream reply
    await this.groqService.getChatCompletionStream(
      messages,
      res,
      'llama-3.3-70b-versatile',
      async (fullContent) => {
        // Save assistant message to DB
        await this.chatService.addMessage(dto.chatId, teacherId, 'assistant', fullContent);
      },
      false, // Free-form chat
    );
  }

  @ApiOperation({ summary: 'Generatsiya qilingan dars materiallarini bazaga saqlash' })
  @Post('save')
  async saveMaterials(@Body() dto: SaveMaterialsDto) {
    return this.lessonGeneratorService.saveLessonMaterials(dto);
  }

  @ApiOperation({ summary: 'O\'qituvchi uchun chat tarixini olish' })
  @Get('history')
  async getHistory(@Request() req: any) {
    const teacherId = req.user.userId;
    const history = await this.chatService.getHistory(teacherId);
    return history;
  }

  @ApiOperation({ summary: 'Chat tarixi tafsilotlarini olish' })
  @Get('history/:id')
  async getChat(@Param('id') id: string, @Request() req: any) {
    const teacherId = req.user.userId;
    return this.chatService.getChat(id, teacherId);
  }

  @ApiOperation({ summary: 'Chat tarixini o\'chirish' })
  @Delete('history/:id')
  async deleteChat(@Param('id') id: string, @Request() req: any) {
    const teacherId = req.user.userId;
    return this.chatService.deleteChat(id, teacherId);
  }

  @ApiOperation({ summary: 'Dashboard AI Assistant Chat (Streaming)' })
  @Post('dashboard-chat')
  async dashboardChat(
    @Body() dto: { message: string; history?: { role: 'user' | 'assistant'; content: string }[]; systemContext?: string },
    @Res() res: Response,
  ) {
    const history = dto.history || [];
    const systemContext = dto.systemContext || '';

    const systemPrompt = `Siz InFast IT-Academy boshqaruv panelining aqlli AI maslahatchisisiz.
Foydalanuvchining o'quv markazi faoliyati haqidagi savollariga javob bering.
Agar sizga tizim ko'rsatkichlari (systemContext) taqdim etilsa, javob berishda ulardan foydalaning.
Tizim ko'rsatkichlari: ${systemContext}
Javobingiz professional, aniq va uzoq bo'lmagan (qisqa va lo'nda) bo'lsin. Til: O'zbek tili.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({ role: h.role as string, content: h.content })),
      { role: 'user', content: dto.message },
    ];

    await this.groqService.getChatCompletionStream(
      messages,
      res,
      'llama-3.3-70b-versatile',
      undefined,
      false,
    );
  }
}
