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
      latitude: Number(dto.latitude) || 41.311081,
      longitude: Number(dto.longitude) || 69.240562,
      radiusMeters: Number(dto.radiusMeters) || 200,
    };
    return this.academyConfig;
  }

  async checkInGeofenced(userId: string, dto: GeofencedCheckInDto) {
    // 1. Anti-spoofing check
    if (dto.isMocked) {
      throw new BadRequestException('GPS soxtalashtirish (Mock Location) aniqlandi! Haqiqiy GPS joylashuvingizdan foydalaning.');
    }

    const isValidId = Types.ObjectId.isValid(userId);
    const idObj = isValidId ? new Types.ObjectId(userId) : userId;

    // 2. Fetch student profile (flexible query by userId or _id)
    const profile = await this.studentProfileModel.findOne({
      $or: [{ userId: idObj }, { _id: idObj }, { userId: userId }, { _id: userId }],
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
    await this.studentsService.updateLiveLocation(profile.userId.toString(), dto.latitude, dto.longitude, false);
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
    const rawStudentId = dto.studentId;
    const isValidId = Types.ObjectId.isValid(rawStudentId);
    const idObj = isValidId ? new Types.ObjectId(rawStudentId) : rawStudentId;
    const groupIdObj = Types.ObjectId.isValid(dto.groupId) ? new Types.ObjectId(dto.groupId) : dto.groupId;
    const lessonIdObj = dto.lessonId && Types.ObjectId.isValid(dto.lessonId) ? new Types.ObjectId(dto.lessonId) : undefined;

    const profile = await this.studentProfileModel.findOne({
      $or: [{ userId: idObj }, { _id: idObj }, { userId: rawStudentId }, { _id: rawStudentId }],
    }).exec();

    const studentIdObj = profile ? profile.userId : idObj;

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
        lessonNumber: dto.lessonNumber || (profile ? profile.currentLessonOrder : 1) || 1,
        status: dto.status,
        date: new Date(),
      });
      await newAttendance.save();
    }

    if (xpDelta !== 0 || coinDelta !== 0) {
      try {
        await this.studentsService.addXpAndCoins(studentIdObj.toString(), xpDelta, coinDelta);
      } catch (err) {
        // Ignore if user rewards update fails
      }
    }

    await this.recalculateAttendancePercentage(studentIdObj.toString());

    return (existing || await this.attendanceModel.findOne(queryFilter).exec()) as any;
  }

  async markAttendanceBatch(dto: BatchAttendanceDto): Promise<any[]> {
    const results = [];
    for (const record of dto.records) {
      try {
        const res = await this.markAttendance({
          studentId: record.studentId,
          groupId: dto.groupId,
          lessonId: dto.lessonId,
          lessonNumber: dto.lessonNumber,
          status: record.status,
        });
        results.push(res);

        if (record.status === AttendanceStatus.PRESENT) {
          const rawId = record.studentId;
          const isValidId = Types.ObjectId.isValid(rawId);
          const idObj = isValidId ? new Types.ObjectId(rawId) : rawId;

          const profile = await this.studentProfileModel.findOne({
            $or: [{ userId: idObj }, { _id: idObj }, { userId: rawId }, { _id: rawId }],
          }).exec();

          if (profile) {
            const currentOrder = profile.currentLessonOrder || 1;
            await this.studentProfileModel.findByIdAndUpdate(profile._id, {
              currentLessonOrder: currentOrder + 1,
            }).exec();
          }
        }
      } catch (e) {
        // Continue loop if single record fails
      }
    }
    return results;
  }

  async getStudentAttendance(studentId: string): Promise<AttendanceDocument[]> {
    const isValidId = Types.ObjectId.isValid(studentId);
    const idObj = isValidId ? new Types.ObjectId(studentId) : studentId;

    return this.attendanceModel
      .find({ $or: [{ studentId: idObj }, { studentId: studentId }] })
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

  async getGroupAttendanceByDate(groupId: string, date: string): Promise<any[]> {
    const isValidGroupId = Types.ObjectId.isValid(groupId);
    const gId = isValidGroupId ? new Types.ObjectId(groupId) : groupId;

    let startOfDay: Date;
    let endOfDay: Date;

    if (date && date.includes('-')) {
      const parts = date.split('-').map(Number);
      startOfDay = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
      endOfDay = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
    } else {
      const d = date ? new Date(date) : new Date();
      startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    }

    const logs = await this.attendanceModel
      .find({
        groupId: gId,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .populate('studentId', 'fullName email phone studentPhone')
      .sort({ date: -1 })
      .exec();

    return logs.map((log: any) => {
      const studentDoc = log.studentId as any;
      const studentUserId = studentDoc?._id ? studentDoc._id.toString() : (log.studentId ? log.studentId.toString() : '');
      return {
        _id: log._id,
        status: log.status,
        isGeofenced: log.isGeofenced,
        isMockedLocation: log.isMockedLocation,
        distanceFromAcademy: log.distanceFromAcademy,
        date: log.date,
        lessonNumber: log.lessonNumber,
        userId: studentUserId,
        studentId: studentUserId,
        studentName: studentDoc?.fullName || '',
      };
    });
  }

  async resetAllAttendance(): Promise<{ success: boolean; message: string; deletedCount: number }> {
    const res = await this.attendanceModel.deleteMany({}).exec();
    await this.studentProfileModel.updateMany({}, { attendancePercentage: 100 }).exec();
    return {
      success: true,
      message: "Barcha o'quvchilarning davomat tarixi to'liq o'chirildi va qayta tiklandi!",
      deletedCount: res.deletedCount || 0,
    };
  }

  async getGroupAttendanceForLesson(groupId: string, lessonId: string): Promise<AttendanceDocument[]> {
    const isValidGroupId = Types.ObjectId.isValid(groupId);
    const gId = isValidGroupId ? new Types.ObjectId(groupId) : groupId;
    const isValidLessonId = Types.ObjectId.isValid(lessonId);
    const lId = isValidLessonId ? new Types.ObjectId(lessonId) : lessonId;

    return this.attendanceModel
      .find({ groupId: gId, lessonId: lId })
      .populate('studentId', 'fullName email phone')
      .exec();
  }

  private async recalculateAttendancePercentage(studentId: string): Promise<void> {
    const isValidId = Types.ObjectId.isValid(studentId);
    const studentIdObj = isValidId ? new Types.ObjectId(studentId) : studentId;

    const totalLogs = await this.attendanceModel.countDocuments({
      $or: [{ studentId: studentIdObj }, { studentId }],
    }).exec();

    if (totalLogs === 0) {
      await this.studentProfileModel.findOneAndUpdate(
        { $or: [{ userId: studentIdObj }, { _id: studentIdObj }, { userId: studentId }, { _id: studentId }] },
        { attendancePercentage: 100 }
      ).exec();
      return;
    }

    const presentLogs = await this.attendanceModel.countDocuments({
      $or: [{ studentId: studentIdObj }, { studentId }],
      status: AttendanceStatus.PRESENT,
    }).exec();

    const attendancePercentage = Math.round((presentLogs / totalLogs) * 100);

    await this.studentProfileModel.findOneAndUpdate(
      { $or: [{ userId: studentIdObj }, { _id: studentIdObj }, { userId: studentId }, { _id: studentId }] },
      { attendancePercentage }
    ).exec();
  }
}
