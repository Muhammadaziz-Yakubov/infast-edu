import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { StudentProfile, StudentProfileDocument } from '../students/schemas/student-profile.schema';
import { StudentsService } from '../students/students.service';
import { MarkAttendanceDto, BatchAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceStatus } from '../../common/enums/status.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    private readonly studentsService: StudentsService
  ) {}

  async markAttendance(dto: MarkAttendanceDto): Promise<AttendanceDocument> {
    const studentIdObj = new Types.ObjectId(dto.studentId);
    const groupIdObj = new Types.ObjectId(dto.groupId);
    const lessonIdObj = new Types.ObjectId(dto.lessonId);

    // 1. Check if student profile exists
    const profile = await this.studentProfileModel.findOne({ userId: studentIdObj }).exec();
    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    // 2. Check if attendance was already recorded
    const existing = await this.attendanceModel.findOne({
      studentId: studentIdObj,
      lessonId: lessonIdObj,
    }).exec();

    let xpDelta = 0;
    let coinDelta = 0;

    if (existing) {
      // Re-marking attendance
      if (existing.status !== dto.status) {
        if (dto.status === AttendanceStatus.PRESENT) {
          // Changed from ABSENT to PRESENT: reverse penalty (-200 XP, -50 coins) and apply reward (+100 XP, +20 coins)
          xpDelta = 300;
          coinDelta = 70;
        } else {
          // Changed from PRESENT to ABSENT: reverse reward (+100 XP, +20 coins) and apply penalty (-200 XP, -50 coins)
          xpDelta = -300;
          coinDelta = -70;
        }
        existing.status = dto.status;
        existing.date = new Date();
        await existing.save();
      }
    } else {
      // First time marking
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
        status: dto.status,
        date: new Date(),
      });
      await newAttendance.save();
    }

    // 3. Apply XP and Coin changes
    if (xpDelta !== 0 || coinDelta !== 0) {
      await this.studentsService.addXpAndCoins(dto.studentId, xpDelta, coinDelta);
    }

    // 4. Recalculate attendance percentage
    await this.recalculateAttendancePercentage(dto.studentId);

    return this.attendanceModel.findOne({ studentId: studentIdObj, lessonId: lessonIdObj }).exec() as any;
  }

  async markAttendanceBatch(dto: BatchAttendanceDto): Promise<any[]> {
    const results = [];
    for (const record of dto.records) {
      const res = await this.markAttendance({
        studentId: record.studentId,
        groupId: dto.groupId,
        lessonId: dto.lessonId,
        status: record.status,
      });
      results.push(res);
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
