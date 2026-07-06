import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Bot, InlineKeyboard, Keyboard, InputFile } from 'grammy';
import { User, UserDocument } from '../users/schemas/user.schema';
import { StudentProfile, StudentProfileDocument } from '../students/schemas/student-profile.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Group, GroupDocument } from '../groups/schemas/group.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { TelegramBotLog, TelegramBotLogDocument } from './schemas/telegram-bot-log.schema';
import { ITelegramBotService } from './interfaces/telegram-bot-service.interface';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Role } from '../../common/enums/roles.enum';
import { UserStatus, PaymentStatus } from '../../common/enums/status.enum';

@Injectable()
export class TelegramBotService implements ITelegramBotService, OnApplicationBootstrap, OnModuleDestroy {
  private bot: Bot;
  private readonly logger = new Logger(TelegramBotService.name);
  
  // Quick in-memory session mapping for stateful actions (e.g. searching, custom date input)
  private userSessions = new Map<string, { state: string; data?: any }>();

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(TelegramBotLog.name) private readonly logModel: Model<TelegramBotLogDocument>,
  ) {}

  async onApplicationBootstrap() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not configured. Telegram Bot will not start.');
      return;
    }

    try {
      this.bot = new Bot(token);
      this.setupHandlers();
      
      // Start bot in background
      this.bot.start().catch((err) => {
        this.logger.error('Failed to start Telegram Bot polling', err);
      });
      
      this.logger.log('Director Telegram Bot successfully initialized and polling started.');
    } catch (error) {
      this.logger.error('Error bootstrapping Telegram Bot:', error);
    }
  }

  async onModuleDestroy() {
    if (this.bot) {
      await this.bot.stop();
      this.logger.log('Telegram Bot polling stopped.');
    }
  }

  /**
   * Main menu layout keyboard
   */
  private getMainMenu() {
    return new Keyboard()
      .text('🏠 Bosh sahifa').text("💰 To'lovlar").row()
      .text('📊 Hisobotlar').text('👨🎓 O\'quvchilar').row()
      .text('🔔 Bildirishnomalar').text('⚙️ Sozlamalar')
      .resized();
  }

  /**
   * Set up bot listeners, commands, middlewares
   */
  private setupHandlers() {
    // 1. Logging and Security Middleware
    this.bot.use(async (ctx, next) => {
      const fromId = ctx.from?.id;
      if (!fromId) return;

      // Log interaction to MongoDB
      await this.logInteraction(ctx);

      // Check if user is allowed
      const user = await this.userModel.findOne({
        telegramId: fromId.toString(),
        status: UserStatus.ACTIVE as any,
      } as any).exec();

      if (!user) {
        // Allow command /start to reply with warning if unauthorized
        if (ctx.message?.text === '/start') {
          await ctx.reply(
            "Sizda ushbu botdan foydalanish huquqi mavjud emas.\n" +
            "Iltimos, profilingizga Telegram ID kiritilganligini tekshiring.",
            { reply_markup: { remove_keyboard: true } }
          );
        } else {
          await ctx.reply("Sizda ushbu botdan foydalanish huquqi mavjud emas.");
        }
        return;
      }

      // Procced if authorized
      await next();
    });

    // 2. Command /start
    this.bot.command('start', async (ctx) => {
      const name = ctx.from?.first_name || 'Director';
      await ctx.reply(
        `Assalomu alaykum, ${name}! InFast IT-Academy Director boshqaruv botiga xush kelibsiz.\n\n` +
        `Kerakli bo'limni tanlang:`,
        { reply_markup: this.getMainMenu() }
      );
    });

    // 3. Menu Text Listeners
    this.bot.hears('🏠 Bosh sahifa', async (ctx) => {
      this.clearSession(ctx.from!.id);
      await this.handleHome(ctx);
    });

    this.bot.hears('💰 To\'lovlar', async (ctx) => {
      this.clearSession(ctx.from!.id);
      await this.handlePaymentsMenu(ctx);
    });

    this.bot.hears('📊 Hisobotlar', async (ctx) => {
      this.clearSession(ctx.from!.id);
      await this.handleReportsMenu(ctx);
    });

    this.bot.hears('👨🎓 O\'quvchilar', async (ctx) => {
      this.clearSession(ctx.from!.id);
      await this.handleStudentsMenu(ctx);
    });

    this.bot.hears('🔔 Bildirishnomalar', async (ctx) => {
      this.clearSession(ctx.from!.id);
      await ctx.reply("<b>Bildirishnomalar:</b>\nTizimdagi o'zgarishlar va to'lovlar haqida direktorni xabardor qilish faollashtirilgan. Barcha bildirishnomalar ushbu chatga avtomatik ravishda yuborib turiladi.", { parse_mode: 'HTML' });
    });

    this.bot.hears('⚙️ Sozlamalar', async (ctx) => {
      this.clearSession(ctx.from!.id);
      await this.handleSettings(ctx);
    });

    // 4. Inline Query Callback Handlers
    this.bot.on('callback_query:data', async (ctx) => {
      const data = ctx.callbackQuery.data;
      const userId = ctx.from.id;
      
      await ctx.answerCallbackQuery(); // Acknowledge callback

      if (data === 'payments_today') {
        await this.handleTodayPayments(ctx);
      } else if (data === 'payments_date') {
        await this.showCalendar(ctx);
      } else if (data === 'payments_month') {
        await this.showMonthsList(ctx);
      } else if (data === 'payments_student') {
        this.setSession(userId, 'AWAITING_STUDENT_SEARCH');
        await ctx.reply("Qidirish uchun talabaning ism yoki familiyasini yozib yuboring (Masalan: Alisher):");
      } else if (data === 'payments_revenue') {
        await this.showRevenuePeriods(ctx);
      } else if (data === 'payments_history') {
        await this.handlePaymentsHistory(ctx);
      }
      
      // Calendar Navigation callback queries
      else if (data.startsWith('cal_prev_') || data.startsWith('cal_next_')) {
        const parts = data.split('_');
        const year = parseInt(parts[2]);
        const month = parseInt(parts[3]);
        const delta = parts[1] === 'prev' ? -1 : 1;
        const targetDate = new Date(year, month + delta, 1);
        await this.showCalendar(ctx, targetDate.getFullYear(), targetDate.getMonth());
      }
      
      // Calendar Date Selected
      else if (data.startsWith('cal_date_')) {
        const dateStr = data.substring(9); // YYYY-MM-DD
        await this.handlePaymentsByDate(ctx, new Date(dateStr));
      }
      
      // Month selection for analysis
      else if (data.startsWith('month_analysis_')) {
        const monthIndex = parseInt(data.split('_')[2]); // 0 to 11
        await this.handlePaymentsByMonth(ctx, monthIndex);
      }

      // Student Detail Selection
      else if (data.startsWith('std_detail_')) {
        const studentId = data.split('_')[2];
        await this.showStudentDetail(ctx, studentId);
      }

      // Revenue Period Selection
      else if (data.startsWith('rev_period_')) {
        const period = data.split('_')[2];
        if (period === 'custom') {
          this.setSession(userId, 'AWAITING_REVENUE_CUSTOM_DATE');
          await ctx.reply("Boshlang'ich va tugash sanalarini quyidagi formatda yuboring: <b>YYYY-MM-DD - YYYY-MM-DD</b>\nMasalan: <code>2026-06-01 - 2026-06-30</code>", { parse_mode: 'HTML' });
        } else {
          await this.handleRevenueReport(ctx, period);
        }
      }

      // Report export commands
      else if (data.startsWith('rep_export_')) {
        const parts = data.split('_');
        const format = parts[2] as 'pdf' | 'excel';
        const period = parts[3] as 'daily' | 'weekly' | 'monthly' | 'yearly';
        await ctx.reply(`Hisobot tayyorlanmoqda. Iltimos, ozgina kuting...`);
        await this.sendReportFile(ctx.from.id.toString(), format, period);
      }
    });

    // 5. Stateful Text inputs (Conversations fallback)
    this.bot.on('message:text', async (ctx) => {
      const userId = ctx.from.id;
      const session = this.userSessions.get(userId.toString());
      
      if (session) {
        if (session.state === 'AWAITING_STUDENT_SEARCH') {
          this.clearSession(userId);
          await this.handleStudentSearch(ctx, ctx.message.text);
        } else if (session.state === 'AWAITING_REVENUE_CUSTOM_DATE') {
          this.clearSession(userId);
          await this.handleRevenueCustomDate(ctx, ctx.message.text);
        } else {
          await ctx.reply("Tushunarsiz buyruq. Bosh sahifa menyusidan foydalaning.", { reply_markup: this.getMainMenu() });
        }
      } else {
        await ctx.reply("Kerakli bo'limni quyidagi menyudan tanlang:", { reply_markup: this.getMainMenu() });
      }
    });
  }

  /**
   * Keep user interaction logs in Mongo
   */
  private async logInteraction(ctx: any) {
    try {
      const from = ctx.from;
      if (!from) return;

      const log = new this.logModel({
        telegramId: from.id.toString(),
        username: from.username || '',
        firstName: from.first_name || '',
        lastName: from.last_name || '',
        messageText: ctx.message?.text || '',
        command: ctx.message?.text?.startsWith('/') ? ctx.message.text.split(' ')[0] : undefined,
        action: ctx.callbackQuery?.data || '',
      });
      await log.save();
    } catch (err) {
      this.logger.error('Failed to write TelegramBotLog:', err);
    }
  }

  private setSession(userId: number, state: string, data?: any) {
    this.userSessions.set(userId.toString(), { state, data });
  }

  private clearSession(userId: number) {
    this.userSessions.delete(userId.toString());
  }

  // ==========================================
  // HOME PAGE (BOSH SAHIFA) HANDLER
  // ==========================================
  private async handleHome(ctx: any) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
      // 1. Bugungi tushum (Today's revenue)
      const todayRevenueRes = await this.paymentModel.aggregate([
        { $match: { paymentDate: { $gte: today, $lt: tomorrow }, status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const todayRevenue = todayRevenueRes[0]?.total ?? 0;

      // 2. Shu oy tushumi (This month's revenue)
      const monthRevenueRes = await this.paymentModel.aggregate([
        { $match: { paymentDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }, status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const monthRevenue = monthRevenueRes[0]?.total ?? 0;

      // 3. Faol o'quvchilar (Active students count)
      const activeStudents = await this.userModel.countDocuments({ role: Role.STUDENT as any, status: UserStatus.ACTIVE as any } as any).exec();

      // 4. Qarzdorlar soni (Debtors count)
      const debtors = await this.studentProfileModel.countDocuments({
        paymentStatus: { $in: [PaymentStatus.UNPAID as any, PaymentStatus.OVERDUE as any] }
      } as any).exec();

      // 5. Bugungi to'lovlar soni
      const todayPaymentsCount = await this.paymentModel.countDocuments({
        paymentDate: { $gte: today, $lt: tomorrow },
        status: PaymentStatus.PAID as any
      } as any).exec();

      const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

      const text = 
        `🏠 <b>InFast CRM Bosh sahifa</b>\n\n` +
        `📅 <b>Sana:</b> ${formattedDate}\n\n` +
        `💰 <b>Bugungi tushum:</b> ${todayRevenue.toLocaleString()} so'm\n` +
        `📆 <b>Shu oy tushumi:</b> ${monthRevenue.toLocaleString()} so'm\n` +
        `📈 <b>Bugungi to'lovlar soni:</b> ${todayPaymentsCount} ta\n\n` +
        `👨🎓 <b>Faol o'quvchilar:</b> ${activeStudents} nafar\n` +
        `⚠️ <b>Qarzdorlar soni:</b> ${debtors} nafar\n`;

      await ctx.reply(text, { parse_mode: 'HTML', reply_markup: this.getMainMenu() });
    } catch (e) {
      this.logger.error('Error rendering dashboard:', e);
      await ctx.reply("Ma'lumotlarni olishda xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.");
    }
  }

  // ==========================================
  // PAYMENTS MENU HANDLER
  // ==========================================
  private async handlePaymentsMenu(ctx: any) {
    const keyboard = new InlineKeyboard()
      .text('➕ Bugungi to\'lovlar', 'payments_today').row()
      .text('📅 Sana bo\'yicha', 'payments_date').text('📆 Oy bo\'yicha', 'payments_month').row()
      .text('👤 O\'quvchi bo\'yicha', 'payments_student').text('📈 Daromad', 'payments_revenue').row()
      .text('📜 Oxirgi to\'lovlar', 'payments_history');

    await ctx.reply(
      `💰 <b>To'lovlar bo'limi</b>\n` +
      `Quyidagi to'lov hisobotlarini ko'rish turlarini tanlang:`,
      { parse_mode: 'HTML', reply_markup: keyboard }
    );
  }

  /**
   * Handle Bugungi to'lovlar (Today's payments list)
   */
  private async handleTodayPayments(ctx: any) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const payments = await this.paymentModel
        .find({ paymentDate: { $gte: today, $lt: tomorrow }, status: PaymentStatus.PAID as any } as any)
        .populate('studentId')
        .exec();

      if (payments.length === 0) {
        await ctx.reply("Bugun hozircha hech qanday to'lov amalga oshirilmadi.");
        return;
      }

      let responseText = `➕ <b>Bugungi to'lovlar ro'yxati (${payments.length} ta):</b>\n\n`;

      for (let i = 0; i < payments.length; i++) {
        const p = payments[i];
        const student = p.studentId as any;
        const studentName = student?.fullName || "Noma'lum talaba";
        
        // Fetch course name
        let courseName = "Birlashtirilmagan";
        const studentProfile = await this.studentProfileModel.findOne({ userId: student?._id }).populate('courseId').exec();
        if (studentProfile?.courseId) {
          courseName = (studentProfile.courseId as any).name || courseName;
        }

        const date = new Date(p.paymentDate);
        const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

        responseText += 
          `<b>${i + 1}. 👨🎓 O'quvchi:</b> ${studentName}\n` +
          `📚 <b>Kurs:</b> ${courseName}\n` +
          `💰 <b>Summa:</b> ${p.amount.toLocaleString()} so'm\n` +
          `💳 <b>To'lov turi:</b> ${p.paymentMethod || 'Click'}\n` +
          `🕒 <b>Vaqt:</b> ${timeStr}\n` +
          `👤 <b>Kirituvchi:</b> ${p.createdBy || 'Tizim'}\n` +
          `-----------------------------------\n`;
      }

      await ctx.reply(responseText, { parse_mode: 'HTML' });
    } catch (e) {
      this.logger.error('Error fetching today payments:', e);
      await ctx.reply("To'lovlarni yuklashda xatolik yuz berdi.");
    }
  }

  /**
   * Handle historical payments history (latest 5 payments)
   */
  private async handlePaymentsHistory(ctx: any) {
    try {
      const payments = await this.paymentModel
        .find({ status: PaymentStatus.PAID as any } as any)
        .sort({ paymentDate: -1 })
        .limit(5)
        .populate('studentId')
        .exec();

      if (payments.length === 0) {
        await ctx.reply("Tizimda to'lovlar mavjud emas.");
        return;
      }

      let responseText = `📜 <b>Oxirgi 5 ta to'lov tarixi:</b>\n\n`;

      for (let i = 0; i < payments.length; i++) {
        const p = payments[i];
        const student = p.studentId as any;
        const studentName = student?.fullName || "Noma'lum talaba";

        const date = new Date(p.paymentDate);
        const dateStr = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

        responseText += 
          `<b>${i + 1}. 👨🎓 O'quvchi:</b> ${studentName}\n` +
          `💰 <b>Summa:</b> ${p.amount.toLocaleString()} so'm\n` +
          `💳 <b>Turi:</b> ${p.paymentMethod || 'Click'}\n` +
          `📅 <b>Sana:</b> ${dateStr}\n` +
          `👤 <b>Kirituvchi:</b> ${p.createdBy || 'Tizim'}\n` +
          `-----------------------------------\n`;
      }

      await ctx.reply(responseText, { parse_mode: 'HTML' });
    } catch (e) {
      this.logger.error('Error fetching payments history:', e);
      await ctx.reply("To'lov tarixini yuklashda xatolik yuz berdi.");
    }
  }

  // ==========================================
  // CALENDAR INTEGRATION (SANA BO'YICHA)
  // ==========================================
  private async showCalendar(ctx: any, currentYear?: number, currentMonth?: number) {
    const today = new Date();
    const targetYear = currentYear !== undefined ? currentYear : today.getFullYear();
    const targetMonth = currentMonth !== undefined ? currentMonth : today.getMonth();

    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);

    const monthNames = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];

    const keyboard = new InlineKeyboard();
    
    // Header navigation
    keyboard.text('<<', `cal_prev_${targetYear}_${targetMonth}`)
      .text(`${monthNames[targetMonth]} ${targetYear}`, 'cal_ignore')
      .text('>>', `cal_next_${targetYear}_${targetMonth}`)
      .row();

    // Weekdays
    const weekDays = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
    weekDays.forEach(day => keyboard.text(day, 'cal_ignore'));
    keyboard.row();

    // Padding empty buttons before first day of month
    // JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday. We map to 0 is Monday ... 6 is Sunday
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6; // Sunday

    for (let i = 0; i < startDayIdx; i++) {
      keyboard.text(' ', 'cal_ignore');
    }

    // Days grid
    const totalDays = lastDay.getDate();
    let currentCellCount = startDayIdx;

    for (let day = 1; day <= totalDays; day++) {
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(targetMonth + 1).padStart(2, '0');
      const fullDateStr = `${targetYear}-${monthStr}-${dayStr}`;

      keyboard.text(`${day}`, `cal_date_${fullDateStr}`);
      currentCellCount++;

      if (currentCellCount % 7 === 0) {
        keyboard.row();
      }
    }

    // Pad remaining empty cells in final row if needed
    const remainingCells = 7 - (currentCellCount % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        keyboard.text(' ', 'cal_ignore');
      }
      keyboard.row();
    }

    const messageText = `📅 <b>Sana bo'yicha to'lovlarni ko'rish</b>\nKalendardan kerakli sanani tanlang:`;
    
    // Check if we are modifying an existing message (callback query calendar nav)
    if (ctx.callbackQuery) {
      await ctx.editMessageText(messageText, { parse_mode: 'HTML', reply_markup: keyboard });
    } else {
      await ctx.reply(messageText, { parse_mode: 'HTML', reply_markup: keyboard });
    }
  }

  private async handlePaymentsByDate(ctx: any, targetDate: Date) {
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23,59,59,999);

    try {
      const payments = await this.paymentModel
        .find({ paymentDate: { $gte: startOfDay, $lte: endOfDay }, status: PaymentStatus.PAID as any } as any)
        .populate('studentId')
        .exec();

      const formattedDate = `${String(targetDate.getDate()).padStart(2, '0')}.${String(targetDate.getMonth() + 1).padStart(2, '0')}.${targetDate.getFullYear()}`;

      if (payments.length === 0) {
        await ctx.reply(`📅 <b>${formattedDate}</b> sanasida hech qanday to'lov amalga oshirilmagan.`, { parse_mode: 'HTML' });
        return;
      }

      let responseText = `📅 <b>${formattedDate} kunidagi to'lovlar (${payments.length} ta):</b>\n\n`;

      for (let i = 0; i < payments.length; i++) {
        const p = payments[i];
        const student = p.studentId as any;
        const studentName = student?.fullName || "Noma'lum talaba";

        responseText += 
          `<b>${i + 1}. 👨🎓 O'quvchi:</b> ${studentName}\n` +
          `💰 <b>Summa:</b> ${p.amount.toLocaleString()} so'm\n` +
          `💳 <b>Turi:</b> ${p.paymentMethod || 'Click'}\n` +
          `👤 <b>Kirituvchi:</b> ${p.createdBy || 'Tizim'}\n` +
          `-----------------------------------\n`;
      }

      await ctx.reply(responseText, { parse_mode: 'HTML' });
    } catch (e) {
      this.logger.error('Error fetching payments by date:', e);
      await ctx.reply("Sana bo'yicha to'lovlarni yuklashda xatolik yuz berdi.");
    }
  }

  // ==========================================
  // MONTH LIST INTEGRATION (OY BO'YICHA)
  // ==========================================
  private async showMonthsList(ctx: any) {
    const months = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];

    const keyboard = new InlineKeyboard();
    for (let i = 0; i < months.length; i += 3) {
      keyboard.text(months[i], `month_analysis_${i}`)
              .text(months[i+1], `month_analysis_${i+1}`)
              .text(months[i+2], `month_analysis_${i+2}`)
              .row();
    }

    await ctx.reply(
      `📆 <b>Oy bo'yicha tahlil hisobotlari</b>\nTahlil qilmoqchi bo'lgan oyingizni tanlang:`,
      { parse_mode: 'HTML', reply_markup: keyboard }
    );
  }

  private async handlePaymentsByMonth(ctx: any, monthIndex: number) {
    const year = new Date().getFullYear();
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

    const monthNames = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];

    try {
      // 1. Total revenue
      const totalRevenueRes = await this.paymentModel.aggregate([
        { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalRevenue = totalRevenueRes[0]?.total ?? 0;

      // 2. Split payment methods
      const methodSplits = await this.paymentModel.aggregate([
        { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'PAID' } },
        { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } }
      ]);

      let cash = 0, card = 0, click = 0, bank = 0;
      methodSplits.forEach(item => {
        const method = (item._id || '').toLowerCase();
        if (method.includes('naqd') || method.includes('cash')) cash += item.total;
        else if (method.includes('karta') || method.includes('card') || method.includes('payme')) card += item.total;
        else if (method.includes('click')) click += item.total;
        else if (method.includes('bank') || method.includes('transfer')) bank += item.total;
        else click += item.total; // Default split category
      });

      // 3. Count payments
      const countPayments = await this.paymentModel.countDocuments({
        paymentDate: { $gte: startDate, $lte: endDate },
        status: PaymentStatus.PAID as any
      } as any);

      // 4. Paid students in this month (unique students)
      const paidStudentsRes = await this.paymentModel.distinct('studentId', {
        paymentDate: { $gte: startDate, $lte: endDate },
        status: PaymentStatus.PAID as any
      } as any);
      const paidStudentsCount = paidStudentsRes.length;

      // 5. Total active debtors currently (overall status)
      const activeDebtors = await this.studentProfileModel.countDocuments({
        paymentStatus: { $in: [PaymentStatus.UNPAID as any, PaymentStatus.OVERDUE as any] }
      } as any);

      const responseText = 
        `📆 <b>${monthNames[monthIndex]} ${year} tahlili:</b>\n\n` +
        `💰 <b>Jami tushum:</b> ${totalRevenue.toLocaleString()} so'm\n` +
        `💵 <b>Naqd:</b> ${cash.toLocaleString()} so'm\n` +
        `💳 <b>Karta (Payme):</b> ${card.toLocaleString()} so'm\n` +
        `📱 <b>Click:</b> ${click.toLocaleString()} so'm\n` +
        `🏛️ <b>Bank o'tkazmasi:</b> ${bank.toLocaleString()} so'm\n\n` +
        `📈 <b>To'lovlar soni:</b> ${countPayments} ta\n` +
        `👨🎓 <b>To'lagan talabalar:</b> ${paidStudentsCount} nafar\n` +
        `⚠️ <b>Joriy qarzdorlar soni:</b> ${activeDebtors} nafar`;

      await ctx.reply(responseText, { parse_mode: 'HTML' });
    } catch (e) {
      this.logger.error('Error building monthly analysis:', e);
      await ctx.reply("Oylik hisobotni shakllantirishda xatolik yuz berdi.");
    }
  }

  // ==========================================
  // STUDENT SEARCH HANDLERS
  // ==========================================
  private async handleStudentSearch(ctx: any, query: string) {
    try {
      // Find students whose fullName contains query string
      const students = await this.userModel.find({
        fullName: { $regex: query, $options: 'i' },
        role: Role.STUDENT as any
      } as any).limit(10).exec();

      if (students.length === 0) {
        await ctx.reply(`⚠️ O'quvchi topilmadi. Iltimos, ismni to'g'ri kiritganingizni tekshiring.`);
        return;
      }

      if (students.length === 1) {
        await this.showStudentDetail(ctx, students[0]._id.toString());
      } else {
        const keyboard = new InlineKeyboard();
        students.forEach((s) => {
          keyboard.text(s.fullName, `std_detail_${s._id}`).row();
        });
        await ctx.reply(`Bir nechta talabalar topildi. Tanlang:`, { reply_markup: keyboard });
      }
    } catch (e) {
      this.logger.error('Error searching student:', e);
      await ctx.reply("Qidiruvda xatolik yuz berdi.");
    }
  }

  private async showStudentDetail(ctx: any, studentId: string) {
    try {
      const student = await this.userModel.findById(studentId).exec();
      if (!student) {
        await ctx.reply("Talaba topilmadi.");
        return;
      }

      const profile = await this.studentProfileModel
        .findOne({ userId: new Types.ObjectId(studentId) })
        .populate('courseId')
        .populate('groupId')
        .exec();

      // Cumulative Payments
      const payments = await this.paymentModel
        .find({ studentId: new Types.ObjectId(studentId), status: PaymentStatus.PAID as any } as any)
        .sort({ paymentDate: -1 })
        .exec();

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const latestPayment = payments[0];
      
      let lastPaymentStr = "Mavjud emas";
      if (latestPayment) {
        const lpd = new Date(latestPayment.paymentDate);
        lastPaymentStr = `${latestPayment.amount.toLocaleString()} so'm (${String(lpd.getDate()).padStart(2, '0')}.${String(lpd.getMonth()+1).padStart(2, '0')}.${lpd.getFullYear()})`;
      }

      const courseName = profile?.courseId ? (profile.courseId as any).name : 'Biriktirilmagan';
      const groupName = profile?.groupId ? (profile.groupId as any).name : 'Biriktirilmagan';
      
      // Calculate Debt (if paymentStatus is overdue or unpaid, show standard monthly cost or warn)
      const debtStatus = profile?.paymentStatus || 'UNPAID';
      let debtStr = "Qarzdorlik yo'q (To'langan)";
      if (debtStatus === 'UNPAID' || debtStatus === 'OVERDUE') {
        debtStr = "⚠️ Qarzdor (Keyingi to'lov muddati o'tgan)";
      }

      let text = 
        `👤 <b>Talaba:</b> ${student.fullName}\n` +
        `📞 <b>Telefon:</b> ${student.phone}\n` +
        `📚 <b>Kurs:</b> ${courseName}\n` +
        `👥 <b>Guruh:</b> ${groupName}\n` +
        `🏆 <b>XP / Tangalar:</b> ${profile?.xp || 0} XP / ${profile?.coins || 0} tanga\n` +
        `📊 <b>Davomat foizi:</b> ${profile?.attendancePercentage || 100}%\n\n` +
        `💳 <b>Jami to'lagan:</b> ${totalPaid.toLocaleString()} so'm\n` +
        `🕒 <b>Oxirgi to'lov:</b> ${lastPaymentStr}\n` +
        `⚠️ <b>Holat:</b> ${debtStr}\n\n`;

      if (payments.length > 0) {
        text += `<b>Oxirgi to'lovlar tarixi:</b>\n`;
        payments.slice(0, 3).forEach((p, idx) => {
          const pd = new Date(p.paymentDate);
          const pdStr = `${String(pd.getDate()).padStart(2, '0')}.${String(pd.getMonth()+1).padStart(2, '0')}.${pd.getFullYear()}`;
          text += `• ${pdStr} - ${p.amount.toLocaleString()} so'm (${p.paymentMethod || 'Click'})\n`;
        });
      }

      await ctx.reply(text, { parse_mode: 'HTML' });
    } catch (e) {
      this.logger.error('Error rendering student details:', e);
      await ctx.reply("Talaba ma'lumotlarini yuklashda xatolik yuz berdi.");
    }
  }

  // ==========================================
  // REVENUE ANALYSIS HANDLERS
  // ==========================================
  private async showRevenuePeriods(ctx: any) {
    const keyboard = new InlineKeyboard()
      .text('Bugun', 'rev_period_today').text('Hafta', 'rev_period_week').row()
      .text('Oy', 'rev_period_month').text('Yil', 'rev_period_year').row()
      .text('Custom muddat', 'rev_period_custom');

    await ctx.reply("📈 <b>Daromad tahlilini ko'rish</b>\nTahlil oralig'ini tanlang:", { parse_mode: 'HTML', reply_markup: keyboard });
  }

  private async handleRevenueCustomDate(ctx: any, text: string) {
    const dates = text.split('-').map(d => d.trim());
    if (dates.length !== 2) {
      await ctx.reply("Noto'g'ri format. Qaytadan urinib ko'ring (Format: <code>2026-06-01 - 2026-06-30</code>):", { parse_mode: 'HTML' });
      return;
    }

    const start = new Date(dates[0]);
    const end = new Date(dates[1]);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      await ctx.reply("Sana formati noto'g'ri. Qaytadan urinib ko'ring:");
      return;
    }

    await this.calculateRevenueForPeriod(ctx, start, end, `Custom davr (${dates[0]} dan ${dates[1]} gacha)`);
  }

  private async handleRevenueReport(ctx: any, period: string) {
    const now = new Date();
    let start = new Date();
    let label = '';

    if (period === 'today') {
      start.setHours(0,0,0,0);
      label = "Bugungi kun";
    } else if (period === 'week') {
      // Start of current week (Monday)
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff));
      start.setHours(0,0,0,0);
      label = "Shu hafta";
    } else if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      label = "Shu oy";
    } else if (period === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      label = "Shu yil";
    }

    await this.calculateRevenueForPeriod(ctx, start, now, label);
  }

  private async calculateRevenueForPeriod(ctx: any, start: Date, end: Date, label: string) {
    try {
      const payments = await this.paymentModel
        .find({ paymentDate: { $gte: start, $lte: end }, status: PaymentStatus.PAID as any } as any)
        .exec();

      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const count = payments.length;
      const average = count > 0 ? Math.round(totalRevenue / count) : 0;

      // Group payments by date to find highest and lowest revenue days
      const paymentsByDay = new Map<string, number>();
      payments.forEach(p => {
        const dayStr = p.paymentDate.toISOString().split('T')[0];
        paymentsByDay.set(dayStr, (paymentsByDay.get(dayStr) || 0) + p.amount);
      });

      let highestDay = "N/A";
      let highestAmt = 0;
      let lowestDay = "N/A";
      let lowestAmt = Infinity;

      paymentsByDay.forEach((amount, day) => {
        if (amount > highestAmt) {
          highestAmt = amount;
          highestDay = day;
        }
        if (amount < lowestAmt) {
          lowestAmt = amount;
          lowestDay = day;
        }
      });

      if (lowestAmt === Infinity) lowestAmt = 0;

      const responseText = 
        `📊 <b>Daromad hisoboti - ${label}:</b>\n\n` +
        `💰 <b>Jami tushum:</b> ${totalRevenue.toLocaleString()} so'm\n` +
        `💵 <b>O'rtacha tushum (bitta to'lovga):</b> ${average.toLocaleString()} so'm\n` +
        `📈 <b>To'lovlar soni:</b> ${count} ta\n\n` +
        `🔥 <b>Eng katta tushum kuni:</b> ${highestDay} (${highestAmt.toLocaleString()} so'm)\n` +
        `❄️ <b>Eng past tushum kuni:</b> ${lowestDay} (${lowestAmt.toLocaleString()} so'm)`;

      await ctx.reply(responseText, { parse_mode: 'HTML' });
    } catch (e) {
      this.logger.error('Error calculating period revenue:', e);
      await ctx.reply("Daromad hisob-kitobida xatolik yuz berdi.");
    }
  }

  // ==========================================
  // REPORT SELECTIONS (HISOBOTLAR)
  // ==========================================
  private async handleReportsMenu(ctx: any) {
    const keyboard = new InlineKeyboard()
      .text('Kunlik Excel', 'rep_export_excel_daily')
      .text('Kunlik PDF', 'rep_export_pdf_daily').row()
      .text('Haftalik Excel', 'rep_export_excel_weekly')
      .text('Haftalik PDF', 'rep_export_pdf_weekly').row()
      .text('Oylik Excel', 'rep_export_excel_monthly')
      .text('Oylik PDF', 'rep_export_pdf_monthly').row()
      .text('Yillik Excel', 'rep_export_excel_yearly')
      .text('Yillik PDF', 'rep_export_pdf_yearly');

    await ctx.reply(
      `📊 <b>Tizim Hisobotlari Bo'limi</b>\n` +
      `Kerakli davriy hisobot formatini va davrini tanlang. Bot fayllarni avtomatik tarzda shakllantirib, ushbu chatga yuboradi:`,
      { parse_mode: 'HTML', reply_markup: keyboard }
    );
  }

  // ==========================================
  // STUDENTS SUMMARY HANDLER
  // ==========================================
  private async handleStudentsMenu(ctx: any) {
    try {
      const active = await this.userModel.countDocuments({ role: Role.STUDENT as any, status: UserStatus.ACTIVE as any } as any).exec();
      const blocked = await this.userModel.countDocuments({ role: Role.STUDENT as any, status: UserStatus.BLOCKED as any } as any).exec();
      
      const debtors = await this.studentProfileModel.countDocuments({
        paymentStatus: { $in: [PaymentStatus.UNPAID as any, PaymentStatus.OVERDUE as any] }
      } as any).exec();

      const today = new Date();
      today.setHours(0,0,0,0);
      const todayAdded = await this.userModel.countDocuments({
        role: Role.STUDENT as any,
        createdAt: { $gte: today }
      } as any).exec();

      const total = active + blocked;

      const text = 
        `🎓 <b>Talabalar statistikasi:</b>\n\n` +
        `🟢 <b>Faol talabalar:</b> ${active} nafar\n` +
        `🔴 <b>Bloklangan talabalar:</b> ${blocked} nafar\n` +
        `⚠️ <b>Qarzdorlar (To'lov muddati o'tganlar):</b> ${debtors} nafar\n` +
        `🆕 <b>Bugun qo'shilganlar:</b> ${todayAdded} nafar\n` +
        `📊 <b>Jami talabalar soni:</b> ${total} nafar`;

      await ctx.reply(text, { parse_mode: 'HTML' });
    } catch (e) {
      this.logger.error('Error loading students statistics:', e);
      await ctx.reply("Talabalar statistikasini yuklashda xatolik.");
    }
  }

  // ==========================================
  // SETTINGS (SOZLAMALAR)
  // ==========================================
  private async handleSettings(ctx: any) {
    const fromId = ctx.from.id;
    try {
      const user = await this.userModel.findOne({ telegramId: fromId.toString() }).exec();
      if (!user) return;

      const text = 
        `⚙️ <b>Sizning profilingiz:</b>\n\n` +
        `👤 <b>F.I.SH:</b> ${user.fullName}\n` +
        `💼 <b>Lavozim / Rol:</b> ${user.role}\n` +
        `📞 <b>Telefon:</b> ${user.phone}\n` +
        `📧 <b>E-mail:</b> ${user.email || 'Kiritilmagan'}\n` +
        `🆔 <b>Telegram ID:</b> <code>${fromId}</code>\n\n` +
        `<i>Bot faqat siz kabi ruxsat etilgan ma'murlar va direktorlar uchun to'liq Read-Only holatda ishlaydi.</i>`;

      await ctx.reply(text, { parse_mode: 'HTML' });
    } catch (e) {
      await ctx.reply("Sozlamalarni ko'rishda xatolik.");
    }
  }

  // ==========================================================
  // NOTIFICATIONS (EVENT ALERTS TO DIRECTORS) IMPLEMENTATION
  // ==========================================================
  private async sendAlertToDirectors(htmlText: string) {
    if (!this.bot) return;

    try {
      // Find all Super Admins or Admins that have telegramId configured
      const directors = await this.userModel.find({
        role: { $in: [Role.SUPER_ADMIN as any, Role.BRANCH_ADMIN as any, Role.MANAGER as any] },
        status: UserStatus.ACTIVE as any,
        telegramId: { $exists: true, $ne: null }
      } as any).exec();

      for (const director of directors) {
        if (director.telegramId) {
          await this.bot.api.sendMessage(director.telegramId, htmlText, { parse_mode: 'HTML' })
            .catch(err => this.logger.error(`Failed to send alert to director ${director.fullName} (ID: ${director.telegramId}):`, err));
        }
      }
    } catch (e) {
      this.logger.error('Failed to notify directors:', e);
    }
  }

  async notifyPaymentCreated(payment: any): Promise<void> {
    try {
      const student = await this.userModel.findById(payment.studentId).exec();
      const studentName = student?.fullName || "Noma'lum talaba";
      
      const html = 
        `✅ <b>YANGI TO'LOV QABUL QILINDI!</b>\n\n` +
        `👨🎓 <b>Talaba:</b> ${studentName}\n` +
        `💰 <b>Summa:</b> ${payment.amount.toLocaleString()} so'm\n` +
        `💳 <b>Turi:</b> ${payment.paymentMethod || 'Click'}\n` +
        `🕒 <b>Sana/Vaqt:</b> ${new Date(payment.paymentDate).toLocaleString()}\n` +
        `👤 <b>Menejer:</b> ${payment.createdBy || 'Tizim'}`;

      await this.sendAlertToDirectors(html);
    } catch (err) {
      this.logger.error('Error on notifyPaymentCreated:', err);
    }
  }

  async notifyPaymentCancelled(payment: any): Promise<void> {
    try {
      const student = await this.userModel.findById(payment.studentId).exec();
      const studentName = student?.fullName || "Noma'lum talaba";
      
      const html = 
        `💸 <b>TO'LOV BEKOR QILINDI!</b>\n\n` +
        `👨🎓 <b>Talaba:</b> ${studentName}\n` +
        `💰 <b>Summa:</b> ${payment.amount.toLocaleString()} so'm\n` +
        `🕒 <b>Vaqt:</b> ${new Date().toLocaleString()}\n` +
        `⚠️ Ushbu to'lov ma'lumotlar bazasidan o'chirildi.`;

      await this.sendAlertToDirectors(html);
    } catch (err) {
      this.logger.error('Error on notifyPaymentCancelled:', err);
    }
  }

  async notifyPaymentEdited(payment: any): Promise<void> {
    try {
      const student = await this.userModel.findById(payment.studentId).exec();
      const studentName = student?.fullName || "Noma'lum talaba";
      
      const html = 
        `✏️ <b>TO'LOV TAHRIRLANDI!</b>\n\n` +
        `👨🎓 <b>Talaba:</b> ${studentName}\n` +
        `💰 <b>Yangi summa:</b> ${payment.amount.toLocaleString()} so'm\n` +
        `💳 <b>Yangi turi:</b> ${payment.paymentMethod || 'Click'}\n` +
        `🕒 <b>Vaqt:</b> ${new Date().toLocaleString()}`;

      await this.sendAlertToDirectors(html);
    } catch (err) {
      this.logger.error('Error on notifyPaymentEdited:', err);
    }
  }

  async notifyStudentBlocked(student: any): Promise<void> {
    const html = 
      `🚫 <b>O'QUVCHI BLOKLANDI!</b>\n\n` +
      `👨🎓 <b>Talaba:</b> ${student.fullName}\n` +
      `📞 <b>Telefon:</b> ${student.phone}\n` +
      `🕒 <b>Sana:</b> ${new Date().toLocaleString()}\n` +
      `⚠️ Sababi: To'lov muddati o'tganligi yoki admin tomonidan taqiq.`;

    await this.sendAlertToDirectors(html);
  }

  async notifyStudentUnblocked(student: any): Promise<void> {
    const html = 
      `🔓 <b>TALABA BLOKDAN CHIQARILDI!</b>\n\n` +
      `👨🎓 <b>Talaba:</b> ${student.fullName}\n` +
      `📞 <b>Telefon:</b> ${student.phone}\n` +
      `🕒 <b>Sana:</b> ${new Date().toLocaleString()}\n` +
      `✅ Talabaga ilovadan foydalanish huquqi qaytarildi.`;

    await this.sendAlertToDirectors(html);
  }

  async notifyStudentCreated(student: any): Promise<void> {
    const html = 
      `👤 <b>YANGI O'QUVCHI QO'SHILDI</b>\n\n` +
      `👨🎓 <b>Talaba:</b> ${student.fullName}\n` +
      `📞 <b>Telefon:</b> ${student.phone}\n` +
      `🕒 <b>Sana:</b> ${new Date().toLocaleString()}\n` +
      `🎉 Yangi talaba CRM tizimidan muvaffaqiyatli ro'yxatdan o'tdi.`;

    await this.sendAlertToDirectors(html);
  }

  async notifyStudentDeleted(student: any): Promise<void> {
    const html = 
      `❌ <b>TALABA O'CHIRILDI!</b>\n\n` +
      `👨🎓 <b>Talaba:</b> ${student.fullName || 'Noma\'lum'}\n` +
      `🕒 <b>Sana:</b> ${new Date().toLocaleString()}\n` +
      `⚠️ Talaba ma'lumotlari CRM tizimidan o'chirib tashlandi.`;

    await this.sendAlertToDirectors(html);
  }

  // ==========================================
  // REPORT DOC GENERATION & TELEGRAM DISPATCH
  // ==========================================
  async generateReportExcelBuffer(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<Buffer> {
    const now = new Date();
    let start = new Date();
    if (period === 'daily') start.setHours(0, 0, 0, 0);
    else if (period === 'weekly') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff));
      start.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') start = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'yearly') start = new Date(now.getFullYear(), 0, 1);

    const payments = await this.paymentModel
      .find({ paymentDate: { $gte: start, $lte: now }, status: PaymentStatus.PAID as any } as any)
      .populate('studentId')
      .exec();

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('To\'lovlar');

    sheet.columns = [
      { header: '№', key: 'id', width: 5 },
      { header: 'Talaba F.I.SH', key: 'studentName', width: 30 },
      { header: 'To\'lov Summasi (so\'m)', key: 'amount', width: 25 },
      { header: 'To\'lov Usuli', key: 'method', width: 15 },
      { header: 'Sana', key: 'date', width: 20 },
      { header: 'Kirituvchi', key: 'createdBy', width: 20 }
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' }
    };

    payments.forEach((p, idx) => {
      const student = p.studentId as any;
      sheet.addRow({
        id: idx + 1,
        studentName: student?.fullName || 'Noma\'lum',
        amount: p.amount,
        method: p.paymentMethod || 'Click',
        date: new Date(p.paymentDate).toLocaleString(),
        createdBy: p.createdBy || 'Tizim'
      });
    });

    sheet.addRow([]);
    sheet.addRow({
      studentName: 'JAMI TUSHUM:',
      amount: totalRevenue
    });
    const summaryRow = sheet.lastRow;
    if (summaryRow) {
      summaryRow.font = { bold: true };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as ArrayBuffer);
  }

  async generateReportPdfBuffer(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<Buffer> {
    const now = new Date();
    let start = new Date();
    if (period === 'daily') start.setHours(0, 0, 0, 0);
    else if (period === 'weekly') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff));
      start.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') start = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'yearly') start = new Date(now.getFullYear(), 0, 1);

    const payments = await this.paymentModel
      .find({ paymentDate: { $gte: start, $lte: now }, status: PaymentStatus.PAID as any } as any)
      .populate('studentId')
      .exec();

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return new Promise((resolve, reject) => {
      try {
        const doc = new (PDFDocument as any)({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // Write PDF Content
        doc.fontSize(20).text(`InFast IT-Academy CRM Hisoboti`, { align: 'center' });
        doc.fontSize(14).text(`${period.toUpperCase()} Hisoboti (${new Date(start).toLocaleDateString()} - ${new Date(now).toLocaleDateString()})`, { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).text(`Jami tushum: ${totalRevenue.toLocaleString()} so'm`);
        doc.text(`Barcha to'lovlar soni: ${payments.length} ta`);
        doc.moveDown();

        doc.text(`------------------------------------------------------------------`);
        
        payments.forEach((p, idx) => {
          const student = p.studentId as any;
          doc.fontSize(10).text(
            `${idx + 1}. Talaba: ${student?.fullName || 'Noma\'lum'} | Summa: ${p.amount.toLocaleString()} UZS | Turi: ${p.paymentMethod || 'Click'} | Kirituvchi: ${p.createdBy || 'Tizim'}`
          );
        });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  async sendReportFile(chatId: string, format: 'pdf' | 'excel', period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<void> {
    if (!this.bot) return;

    try {
      const now = new Date();
      const periodLabel = period === 'daily' ? 'Kunlik' : period === 'weekly' ? 'Haftalik' : period === 'monthly' ? 'Oylik' : 'Yillik';
      const filename = `Hisobot_${periodLabel}_${now.toISOString().split('T')[0]}`;

      // Get count & total
      let start = new Date();
      if (period === 'daily') start.setHours(0,0,0,0);
      else if (period === 'weekly') {
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(start.setDate(diff));
        start.setHours(0,0,0,0);
      } else if (period === 'monthly') start = new Date(now.getFullYear(), now.getMonth(), 1);
      else if (period === 'yearly') start = new Date(now.getFullYear(), 0, 1);

      const payments = await this.paymentModel
        .find({ paymentDate: { $gte: start, $lte: now }, status: PaymentStatus.PAID as any } as any)
        .exec();

      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

      if (format === 'excel') {
        const buffer = await this.generateReportExcelBuffer(period);
        await this.bot.api.sendDocument(chatId, new InputFile(buffer, `${filename}.xlsx`), {
          caption: `📊 <b>InFast Academy ${periodLabel} Moliyaviy Hisoboti</b>\n\n` +
                   `💰 <b>Jami tushum:</b> ${totalRevenue.toLocaleString()} so'm\n` +
                   `📊 <b>To'lovlar soni:</b> ${payments.length} ta\n` +
                   `📅 <b>Generatsiya vaqti:</b> ${new Date().toLocaleString()}`,
          parse_mode: 'HTML'
        });
      } else if (format === 'pdf') {
        const buffer = await this.generateReportPdfBuffer(period);
        await this.bot.api.sendDocument(chatId, new InputFile(buffer, `${filename}.pdf`), {
          caption: `📊 <b>InFast Academy ${periodLabel} Moliyaviy Hisoboti (PDF)</b>\n\n` +
                   `💰 <b>Jami tushum:</b> ${totalRevenue.toLocaleString()} so'm\n` +
                   `📅 <b>Sana:</b> ${new Date().toLocaleDateString()}`,
          parse_mode: 'HTML'
        });
      }
    } catch (e) {
      this.logger.error('Failed to generate/send report document via bot:', e);
      await this.bot.api.sendMessage(chatId, `❌ Hisobot faylini yaratishda xatolik yuz berdi: ${e.message}`);
    }
  }
}
