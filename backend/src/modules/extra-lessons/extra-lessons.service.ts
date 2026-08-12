import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExtraLessonSlot, ExtraLessonSlotDocument, ExtraLessonSlotStatus, ExtraLessonAttendanceStatus } from './schemas/extra-lesson-slot.schema';
import { CreateSlotDto } from './dto/create-slot.dto';
import { BookSlotDto } from './dto/book-slot.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { StudentsService } from '../students/students.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../common/enums/status.enum';

@Injectable()
export class ExtraLessonsService {
  constructor(
    @InjectModel(ExtraLessonSlot.name)
    private readonly slotModel: Model<ExtraLessonSlotDocument>,
    private readonly studentsService: StudentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createSlot(dto: CreateSlotDto, adminId?: string): Promise<ExtraLessonSlotDocument> {
    const slot = new this.slotModel({
      date: dto.date,
      startTime: dto.startTime,
      title: dto.title || "Qo'shimcha dars",
      note: dto.note || '',
      status: ExtraLessonSlotStatus.AVAILABLE,
      attendanceStatus: ExtraLessonAttendanceStatus.PENDING,
      createdBy: adminId ? new Types.ObjectId(adminId) : undefined,
    });
    return slot.save();
  }

  async getAllSlotsForAdmin(dateFilter?: string): Promise<any[]> {
    const filter: any = {};
    if (dateFilter) {
      filter.date = dateFilter;
    }

    const slots = await this.slotModel
      .find(filter)
      .populate('bookedBy', 'fullName phone studentPhone parentPhone avatar email')
      .populate('createdBy', 'fullName')
      .sort({ date: 1, startTime: 1 })
      .exec();

    return slots;
  }

  async getAvailableSlots(): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    const slots = await this.slotModel
      .find({
        status: ExtraLessonSlotStatus.AVAILABLE,
        date: { $gte: today },
      })
      .sort({ date: 1, startTime: 1 })
      .exec();

    return slots;
  }

  async bookSlot(studentId: string, dto: BookSlotDto): Promise<ExtraLessonSlotDocument> {
    const slot = await this.slotModel.findById(dto.slotId).exec();
    if (!slot) {
      throw new NotFoundException("Bunday bo'sh vaqt topilmadi");
    }

    if (slot.status !== ExtraLessonSlotStatus.AVAILABLE) {
      throw new ConflictException("Ushbu vaqt allaqachon band qilingan yoki yakunlangan");
    }

    slot.status = ExtraLessonSlotStatus.BOOKED;
    slot.bookedBy = new Types.ObjectId(studentId);
    slot.reason = dto.reason;
    slot.bookedAt = new Date();
    slot.attendanceStatus = ExtraLessonAttendanceStatus.PENDING;

    const saved = await slot.save();

    // Trigger Push Notification to Student
    await this.notificationsService.create(
      studentId,
      "📅 Qo'shimcha dars band qilindi!",
      `Siz ${slot.date} soat ${slot.startTime} darsiga muvaffaqiyatli yozildingiz. O'z vaqtida kelishingizni so'raymiz!`,
      NotificationType.ANNOUNCEMENT,
      { type: 'EXTRA_LESSON', slotId: slot._id }
    ).catch(() => {});

    return saved;
  }

  async getStudentBookings(studentId: string): Promise<any[]> {
    const slots = await this.slotModel
      .find({ bookedBy: new Types.ObjectId(studentId) })
      .sort({ date: -1, startTime: -1 })
      .exec();

    return slots;
  }

  async updateAttendance(slotId: string, dto: UpdateAttendanceDto): Promise<ExtraLessonSlotDocument> {
    const slot = await this.slotModel.findById(slotId).exec();
    if (!slot) {
      throw new NotFoundException("Qo'shimcha dars topilmadi");
    }

    if (!slot.bookedBy) {
      throw new BadRequestException("Ushbu vaqtga hech qanday o'quvchi yozilmagan");
    }

    const newStatus = dto.attendanceStatus;
    const oldStatus = slot.attendanceStatus;

    if (newStatus === oldStatus) {
      return slot;
    }

    // Handle coin and XP logic based on transitions
    if (newStatus === ExtraLessonAttendanceStatus.ATTENDED) {
      if (oldStatus === ExtraLessonAttendanceStatus.PENDING) {
        await this.studentsService.addXpAndCoins(slot.bookedBy, 50, 100);
      } else if (oldStatus === ExtraLessonAttendanceStatus.ABSENT) {
        await this.studentsService.addXpAndCoins(slot.bookedBy, 50, 300);
      }
      slot.attendanceStatus = ExtraLessonAttendanceStatus.ATTENDED;
      slot.status = ExtraLessonSlotStatus.COMPLETED;

      // Push notification
      await this.notificationsService.create(
        slot.bookedBy.toString(),
        "🎉 Darsga kelganingiz tasdiqlandi!",
        "Qo'shimcha darsda qatnashganingiz uchun +100 Coin 🪙 va +50 XP ⚡ hisobingizga qo'shildi!",
        NotificationType.BONUS,
        { type: 'EXTRA_LESSON_ATTENDED' }
      ).catch(() => {});

    } else if (newStatus === ExtraLessonAttendanceStatus.ABSENT) {
      if (oldStatus === ExtraLessonAttendanceStatus.PENDING) {
        await this.studentsService.addXpAndCoins(slot.bookedBy, 0, -200);
      } else if (oldStatus === ExtraLessonAttendanceStatus.ATTENDED) {
        await this.studentsService.addXpAndCoins(slot.bookedBy, -50, -300);
      }
      slot.attendanceStatus = ExtraLessonAttendanceStatus.ABSENT;
      slot.status = ExtraLessonSlotStatus.COMPLETED;

      // Push notification
      await this.notificationsService.create(
        slot.bookedBy.toString(),
        "⚠️ Qo'shimcha darsga kelmadingiz",
        "Belgilangan darsga kelmaganingiz sababli -200 Coin 🪙 jarima ayrildi.",
        NotificationType.SYSTEM,
        { type: 'EXTRA_LESSON_ABSENT' }
      ).catch(() => {});
    }

    return slot.save();
  }

  async deleteSlot(slotId: string): Promise<any> {
    const slot = await this.slotModel.findById(slotId).exec();
    if (!slot) {
      throw new NotFoundException("Vaqt topilmadi");
    }

    await this.slotModel.findByIdAndDelete(slotId).exec();
    return { success: true, message: "Bo'sh vaqt o'chirildi" };
  }
}
