import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { StudentProfile, StudentProfileDocument } from '../students/schemas/student-profile.schema';
import { StudentsService } from '../students/students.service';
import { MarkAttendanceDto, BatchAttendanceDto, GeofencedCheckInDto, UpdateAcademyConfigDto } from './dto/mark-attendance.dto';
import { AttendanceStatus } from '../../common/enums/status.enum';

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

@Injectable()
export class AttendanceService {
  // Configurable Academy GPS settings (default: Tashkent InFast Academy coordinates)
  private academyConfig = {
    latitude: 41.311081,
    longitude: 69.240562,
    radiusMeters: 200,
  };

  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    private readonly studentsService: StudentsService
  ) {}

  getAcademyConfig() {
    return this.academyConfig;
  }

  updateAcademyConfig(dto: UpdateAcademyConfigDto) {
    this.academyConfig = {
      latitude: dto.latitude,
      longitude: dto.longitude,
      radiusMeters: dto.radiusMeters,
    };
    return this.academyConfig;
  }

  async checkInGeofenced(userId: string, dto: GeofencedCheckInDto) {
    // 1. Anti-spoofing check
    if (dto.isMocked) {
      throw new BadRequestException('GPS soxtalashtirish (Mock Location) aniqlandi! Haqiqiy GPS joylashuvingizdan foydalaning.');
    }

    const studentIdObj = new Types.ObjectId(userId);

    // 2. Fetch student profile
    const profile = await this.studentProfileModel.findOne({
      $or: [{ userId: studentIdObj }, { _id: studentIdObj }],
    }).exec();

    if (!profile) {
      throw new NotFoundException("Talaba profili topilmadi.");
    }

    if (!profile.groupId) {
      throw new BadRequestException("Siz birorta o'quv guruhiga biriktirilmagansiz.");
    }

    // 3. Radius & Distance check
    const distance = calculateDistanceMeters(
      dto.latitude,
      dto.longitude,
      this.academyConfig.latitude,
      this.academyConfig.longitude
    );

    if (distance > this.academyConfig.radiusMeters) {
      throw new BadRequestException(
        `Siz akademiyadan ${distance} metr uzoqdasiz. Davomat qilish uchun ${this.academyConfig.radiusMeters} metr radius ichida bo'lishingiz kerak!`
      );
    }

    // 4. Check if checked in today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingToday = await this.attendanceModel.findOne({
      studentId: profile.userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).exec();

    if (existingToday) {
      throw new BadRequestException("Siz bugun allaqachon davomat qilgansiz!");
    }

    // 5. Record attendance
    const attendanceLog = new this.attendanceModel({
      studentId: profile.userId,
      groupId: profile.groupId,
      lessonNumber: profile.currentLessonOrder || 1,
      status: AttendanceStatus.PRESENT,
      date: new Date(),
      checkInTime: new Date(),
      latitude: dto.latitude,
      longitude: dto.longitude,
      distanceFromAcademy: distance,
      isGeofenced: true,
      isMockedLocation: false,
    });

    await attendanceLog.save();

    // 6. Reward student with +150 XP and +30 Coins for self check-in
    await this.studentsService.addXpAndCoins(profile.userId.toString(), 150, 30);
    await this.recalculateAttendancePercentage(profile.userId.toString());

    return {
      success: true,
      message: "Davomat muvaffaqiyatli topshirildi! 🎉",
      distance,
      xpGained: 150,
      coinGained: 30,
      attendance: attendanceLog,
    };
  }

  async markAttendance(dto: MarkAttendanceDto): Promise<AttendanceDocument> {
    const rawStudentId = new Types.ObjectId(dto.studentId);
    const groupIdObj = new Types.ObjectId(dto.groupId);
    const lessonIdObj = dto.lessonId ? new Types.ObjectId(dto.lessonId) : undefined;

    const profile = await this.studentProfileModel.findOne({
      $or: [{ userId: rawStudentId }, { _id: rawStudentId }],
    }).exec();

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    const studentIdObj = profile.userId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const queryFilter: any = { studentId: studentIdObj, groupId: groupIdObj };
    if (lessonIdObj) {
      queryFilter.lessonId = lessonIdObj;
    } else {
      queryFilter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const existing = await this.attendanceModel.findOne(queryFilter).exec();

    let xpDelta = 0;
    let coinDelta = 0;

    if (existing) {
      if (existing.status !== dto.status) {
        if (dto.status === AttendanceStatus.PRESENT) {
          xpDelta = 300;
          coinDelta = 70;
        } else {
          xpDelta = -300;
          coinDelta = -70;
        }
        if (dto.lessonNumber !== undefined) {
          existing.lessonNumber = dto.lessonNumber;
        }
        existing.status = dto.status;
        existing.date = new Date();
        await existing.save();
      }
    } else {
      if (dto.status === AttendanceStatus.PRESENT) {
        xpDelta = 100;
        coinDelta = 20;
      } else {
        xpDelta = -200;
        coinDelta = -50;
      }

      const newAttendance = new this.attendanceModel({
        studentId: studentIdObj,
        groupId: groupIdObj,
        lessonId: lessonIdObj,
        lessonNumber: dto.lessonNumber || profile.currentLessonOrder || 1,
        status: dto.status,
        date: new Date(),
      });
      await newAttendance.save();
    }

    if (xpDelta !== 0 || coinDelta !== 0) {
      await this.studentsService.addXpAndCoins(studentIdObj.toString(), xpDelta, coinDelta);
    }

    await this.recalculateAttendancePercentage(studentIdObj.toString());

    return (existing || await this.attendanceModel.findOne(queryFilter).exec()) as any;
  }

  async markAttendanceBatch(dto: BatchAttendanceDto): Promise<any[]> {
    const results = [];
    for (const record of dto.records) {
      const res = await this.markAttendance({
        studentId: record.studentId,
        groupId: dto.groupId,
        lessonId: dto.lessonId,
        lessonNumber: dto.lessonNumber,
        status: record.status,
      });
      results.push(res);

      if (record.status === AttendanceStatus.PRESENT) {
        const rawId = new Types.ObjectId(record.studentId);
        const profile = await this.studentProfileModel.findOne({
          $or: [{ userId: rawId }, { _id: rawId }],
        }).exec();
        if (profile) {
          const currentOrder = profile.currentLessonOrder || 1;
          await this.studentProfileModel.findByIdAndUpdate(profile._id, {
            currentLessonOrder: currentOrder + 1,
          }).exec();
        }
      }
    }
    return results;
  }

  async getStudentAttendance(studentId: string): Promise<AttendanceDocument[]> {
    return this.attendanceModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('lessonId', 'title')
      .populate('groupId', 'name')
      .sort({ date: -1 })
      .exec();
  }

  async getAllAttendanceLogs(): Promise<AttendanceDocument[]> {
    return this.attendanceModel
      .find()
      .populate('studentId', 'fullName email phone studentPhone')
      .populate('groupId', 'name')
      .sort({ date: -1 })
      .limit(200)
      .exec();
  }

  async getGroupAttendanceForLesson(groupId: string, lessonId: string): Promise<AttendanceDocument[]> {
    return this.attendanceModel
      .find({
        groupId: new Types.ObjectId(groupId),
        lessonId: new Types.ObjectId(lessonId),
      })
      .populate('studentId', 'fullName email phone')
      .exec();
  }

  private async recalculateAttendancePercentage(studentId: string): Promise<void> {
    const studentIdObj = new Types.ObjectId(studentId);

    const totalLogs = await this.attendanceModel.countDocuments({ studentId: studentIdObj }).exec();
    if (totalLogs === 0) return;

    const presentLogs = await this.attendanceModel.countDocuments({
      studentId: studentIdObj,
      status: AttendanceStatus.PRESENT,
    }).exec();

    const attendancePercentage = Math.round((presentLogs / totalLogs) * 100);

    await this.studentProfileModel.findOneAndUpdate(
      { userId: studentIdObj },
      { attendancePercentage }
    ).exec();
  }
}
