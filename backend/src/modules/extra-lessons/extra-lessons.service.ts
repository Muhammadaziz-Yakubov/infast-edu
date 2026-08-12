import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExtraLessonSlot, ExtraLessonSlotDocument, ExtraLessonSlotStatus, ExtraLessonAttendanceStatus } from './schemas/extra-lesson-slot.schema';
import { CreateSlotDto } from './dto/create-slot.dto';
import { BookSlotDto } from './dto/book-slot.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { StudentsService } from '../students/students.service';

@Injectable()
export class ExtraLessonsService {
  constructor(
    @InjectModel(ExtraLessonSlot.name)
    private readonly slotModel: Model<ExtraLessonSlotDocument>,
    private readonly studentsService: StudentsService,
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

    return slot.save();
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
        // First time marking Attended: +100 Coins, +50 XP
        await this.studentsService.addXpAndCoins(slot.bookedBy, 50, 100);
      } else if (oldStatus === ExtraLessonAttendanceStatus.ABSENT) {
        // Switched from Absent to Attended: Revert -200 coin penalty (+200) AND add +100 coins +50 XP -> Total: +300 coins, +50 XP
        await this.studentsService.addXpAndCoins(slot.bookedBy, 50, 300);
      }
      slot.attendanceStatus = ExtraLessonAttendanceStatus.ATTENDED;
      slot.status = ExtraLessonSlotStatus.COMPLETED;
    } else if (newStatus === ExtraLessonAttendanceStatus.ABSENT) {
      if (oldStatus === ExtraLessonAttendanceStatus.PENDING) {
        // First time marking Absent: -200 Coins
        await this.studentsService.addXpAndCoins(slot.bookedBy, 0, -200);
      } else if (oldStatus === ExtraLessonAttendanceStatus.ATTENDED) {
        // Switched from Attended to Absent: Revert +100 coins & +50 XP (-100 coins, -50 XP) AND apply -200 coins penalty -> Total: -300 coins, -50 XP
        await this.studentsService.addXpAndCoins(slot.bookedBy, -50, -300);
      }
      slot.attendanceStatus = ExtraLessonAttendanceStatus.ABSENT;
      slot.status = ExtraLessonSlotStatus.COMPLETED;
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
