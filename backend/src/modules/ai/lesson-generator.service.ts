import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Response } from 'express';
import { Lesson, LessonDocument } from '../lms/schemas/lesson.schema';
import { CourseModule, CourseModuleDocument } from '../lms/schemas/module.schema';
import { Course } from '../courses/schemas/course.schema';
import { PracticeTask, PracticeTaskDocument } from '../lms/schemas/practice-task.schema';
import { Homework, HomeworkDocument, TaskType } from '../homework/schemas/homework.schema';
import { Group } from '../groups/schemas/group.schema';
import { StudentProfile } from '../students/schemas/student-profile.schema';
import { GroqService } from './groq.service';
import { ChatService } from './chat.service';

@Injectable()
export class LessonGeneratorService {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(CourseModule.name)
    private readonly moduleModel: Model<CourseModuleDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<any>,
    @InjectModel(Group.name)
    private readonly groupModel: Model<any>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<any>,
    @InjectModel(PracticeTask.name)
    private readonly practiceTaskModel: Model<PracticeTaskDocument>,
    @InjectModel(Homework.name)
    private readonly homeworkModel: Model<HomeworkDocument>,
    private readonly groqService: GroqService,
    private readonly chatService: ChatService,
  ) {}

  async generateLesson(
    dto: {
      groupId?: string;
      courseId?: string;
      moduleId?: string;
      lessonId?: string;
      difficulty?: string;
      language?: string;
      topicDescription: string;
      quickActions: string[];
      chatId?: string;
      teacherId: string;
    },
    res: Response,
  ): Promise<void> {
    // 1. Gather context
    let groupName = 'Noma\'lum guruh';
    let courseTitle = 'Noma\'lum kurs';
    let moduleTitle = 'Noma\'lum modul';
    let lessonTitle = 'Noma\'lum dars';
    let studentStatsPrompt = '';
    let previousLessonPrompt = '';
    let nextLessonPrompt = '';

    if (dto.groupId) {
      const group = await this.groupModel.findById(dto.groupId).exec();
      if (group) {
        groupName = group.name;
        // Calculate average XP/Level of students in the group
        if (group.students && group.students.length > 0) {
          const profiles = await this.studentProfileModel
            .find({ userId: { $in: group.students } })
            .select('xp level')
            .exec();
          if (profiles.length > 0) {
            const avgXp = Math.round(profiles.reduce((sum, p) => sum + (p.xp || 0), 0) / profiles.length);
            const avgLevel = Math.round(profiles.reduce((sum, p) => sum + (p.level || 1), 0) / profiles.length);
            studentStatsPrompt = `Talabalar o'rtacha darajasi: Level ${avgLevel}, O'rtacha XP: ${avgXp}.`;
          }
        }
      }
    }

    if (dto.courseId) {
      const course = await this.courseModel.findById(dto.courseId).exec();
      if (course) courseTitle = course.title;
    }

    if (dto.moduleId) {
      const mod = await this.moduleModel.findById(dto.moduleId).exec();
      if (mod) moduleTitle = mod.title;
    }

    let currentLesson: LessonDocument | null = null;
    if (dto.lessonId) {
      currentLesson = await this.lessonModel.findById(dto.lessonId).exec();
      if (currentLesson) {
        lessonTitle = currentLesson.title;

        // Find previous and next lessons
        const prev = await this.lessonModel
          .findOne({ moduleId: currentLesson.moduleId, order: { $lt: currentLesson.order } })
          .sort({ order: -1 })
          .exec();
        if (prev) previousLessonPrompt = `Oldingi dars: "${prev.title}".`;

        const next = await this.lessonModel
          .findOne({ moduleId: currentLesson.moduleId, order: { $gt: currentLesson.order } })
          .sort({ order: 1 })
          .exec();
        if (next) nextLessonPrompt = `Keyingi dars: "${next.title}".`;
      }
    }

    const difficulty = dto.difficulty || 'Medium';
    const language = dto.language || 'Uzbek';

    // 2. Build system and user prompts
    const systemPrompt = `Siz InFast IT-Academy LMS tizimining o'qituvchilar uchun aqlli dars yordamchisi (AI Lesson Creator) hisoblanasiz.
Sizning vazifangiz o'qituvchi bergan ma'lumotlar va dars mavzusi asosida metodik materiallar (Practice, Homework, Quiz, Summary, Objectives) tayyorlashdir.

Siz FAQAT va FAQAT quyidagi JSON formatida javob qaytarishingiz shart. Javobingizni hech qanday markdown ("\`\`\`json" teglari kabi) yoki kirish-chiqish so'zlari bilan o'ramang, to'g'ridan-to'g'ri JSON formatida yuboring:

{
  "practice": {
    "title": "Mavzuga oid amaliy topshiriq sarlavhasi",
    "description": "Amaliy topshiriqning to'liq va batafsil tavsifi, nimalar qilinishi kerakligi",
    "starterCode": "Foydalanuvchi boshlashi uchun dastlabki kod shabloni (agar dasturlashga oid bo'lsa)",
    "validationRules": ["Tizim kodni tekshirishda ishlatadigan qoidalar massivi. Masalan: ['contains', 'const', 'contains', 'keys']"]
  },
  "homework": {
    "title": "Uyga vazifa sarlavhasi",
    "description": "Uyga vazifa tavsifi va bajarish shartlari"
  },
  "lessonSummary": "Darsning qisqacha mazmuni, o'tilgan asosiy tushunchalar",
  "learningObjectives": [
    "Darsdan ko'zlangan asosiy metodik maqsad 1",
    "Darsdan ko'zlangan asosiy metodik maqsad 2"
  ],
  "quizRounds": [
    {
      "round": 1,
      "questions": [
        {
          "question": "1-savol matni",
          "options": ["A variant", "B variant", "C variant", "D variant"],
          "correctAnswer": 0,
          "explanation": "Nima uchun ushbu variant to'g'riligi haqida qisqacha izoh"
        }
      ]
    }
  ]
}

Eslatmalar:
- Agar o'qituvchi ma'lum elementlarni generatsiya qilishni talab qilmagan bo'lsa (yoki quickActions ichida bo'lmasa), u elementlarni JSON ichida null yoki bo'sh qoldiring.
- "quizRounds" bo'limida har bir raund ichida aynan 3 ta test bo'lsin. Jami 4 ta raund (12 ta savol) generatsiya qiling.
- Barcha amaliy topshiriq, savollar, tushuntirishlar va uyga vazifalar belgilangan tilda (${language}) va mos qiyinchilik darajasida (${difficulty}) bo'lsin.`;

    const userPrompt = `DARS METADATALARI:
- Guruh: ${groupName}
- Kurs: ${courseTitle}
- Modul: ${moduleTitle}
- Dars: ${lessonTitle}
- Qiyinchilik darajasi: ${difficulty}
- Til: ${language}
- ${studentStatsPrompt}
- ${previousLessonPrompt}
- ${nextLessonPrompt}

QUICK ACTIONS (Quyidagilarni generatsiya qiling):
${dto.quickActions.map((a) => `- ${a}`).join('\n')}

O'QITUVCHINING DARS TAVSIFI:
"${dto.topicDescription}"

Iltimos, yuqoridagi qoidalarga rioya qilgan holda, faqat so'ralgan materiallarni JSON formatida generatsiya qiling.`;

    // 3. Handle chat history
    let activeChatId = dto.chatId;
    if (!activeChatId) {
      const newChat = await this.chatService.createChat({
        teacherId: dto.teacherId,
        groupId: dto.groupId,
        courseId: dto.courseId,
        moduleId: dto.moduleId,
        lessonId: dto.lessonId,
        difficulty: dto.difficulty,
        language: dto.language,
        quickActions: dto.quickActions,
      });
      activeChatId = newChat._id.toString();
    }

    // Save user message to DB
    await this.chatService.addMessage(activeChatId, dto.teacherId, 'user', dto.topicDescription);

    // Prepare full message history for Groq
    const chat = await this.chatService.getChat(activeChatId, dto.teacherId);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chat.messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userPrompt },
    ];

    // Call Groq API and stream response back to client
    await this.groqService.getChatCompletionStream(
      messages,
      res,
      'llama-3.3-70b-versatile',
      async (fullContent) => {
        // Save AI's response to DB
        await this.chatService.addMessage(activeChatId!, dto.teacherId, 'assistant', fullContent);
      },
      true, // isJson
    );
  }

  async saveLessonMaterials(
    dto: {
      lessonId: string;
      practice?: {
        title: string;
        description: string;
        starterCode?: string;
        validationRules?: string[];
        xpReward?: number;
        coinReward?: number;
      };
      homework?: {
        title: string;
        description: string;
        xpReward?: number;
        coinReward?: number;
      };
      quiz?: {
        question: string;
        options: string[];
        correctAnswerIndex: number;
        round: number;
      }[];
      lessonSummary?: string;
      learningObjectives?: string[];
    },
  ): Promise<any> {
    const lesson = await this.lessonModel.findById(dto.lessonId);
    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    // 1. Save lesson summary & objectives
    if (dto.lessonSummary !== undefined) {
      lesson.lessonSummary = dto.lessonSummary;
    }
    if (dto.learningObjectives !== undefined) {
      lesson.learningObjectives = dto.learningObjectives;
    }

    // 2. Save quiz questions
    if (dto.quiz && dto.quiz.length > 0) {
      lesson.quiz = dto.quiz.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        round: q.round || 1,
      }));
    }

    await lesson.save();

    // 3. Save Practice Task
    let savedPractice = null;
    if (dto.practice) {
      const practiceUpdate = {
        title: dto.practice.title,
        description: dto.practice.description,
        starterCode: dto.practice.starterCode || '',
        validationType: 'contains',
        validationRules: dto.practice.validationRules || [],
        xpReward: dto.practice.xpReward || 50,
        coinReward: dto.practice.coinReward || 10,
        language: 'javascript', // Default
      };

      savedPractice = await this.practiceTaskModel.findOneAndUpdate(
        { lessonId: lesson._id },
        practiceUpdate,
        { upsert: true, new: true },
      ).exec();
    }

    // 4. Save Homework
    let savedHomework = null;
    if (dto.homework) {
      const homeworkUpdate = {
        title: dto.homework.title,
        description: dto.homework.description,
        tasks: [
          {
            id: 'task_1',
            type: TaskType.TEXT,
            question: "Vazifani bajaring va javobingizni matn yoki havola shaklida yuboring.",
            correctAnswer: 'accepted',
          },
        ],
        xpReward: dto.homework.xpReward || 100,
        coinReward: dto.homework.coinReward || 20,
      };

      savedHomework = await this.homeworkModel.findOneAndUpdate(
        { lessonId: lesson._id },
        homeworkUpdate,
        { upsert: true, new: true },
      ).exec();
    }

    return {
      success: true,
      lesson,
      practice: savedPractice,
      homework: savedHomework,
    };
  }
}
