import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { GroupLessonSchedule, GroupLessonScheduleDocument } from './schemas/group-lesson-schedule.schema';
import { CourseModule, CourseModuleDocument } from '../lms/schemas/module.schema';
import { Lesson, LessonDocument } from '../lms/schemas/lesson.schema';
import { StudentsService } from '../students/students.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,
    @InjectModel(GroupLessonSchedule.name)
    private readonly scheduleModel: Model<GroupLessonScheduleDocument>,
    @InjectModel(CourseModule.name)
    private readonly moduleModel: Model<CourseModuleDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentsService: StudentsService
  ) {}

  async createGroup(dto: CreateGroupDto): Promise<GroupDocument> {
    let endDate: Date;
    if (dto.endDate) {
      endDate = new Date(dto.endDate);
    } else {
      const courseModel = this.moduleModel.db.model('Course');
      const course = await courseModel.findById(dto.courseId).exec();
      const durationStr = course?.duration || '6';
      const durationMonths = parseInt(durationStr, 10) || 6;
      endDate = new Date(dto.startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);
    }

    const group = new this.groupModel({
      ...dto,
      courseId: new Types.ObjectId(dto.courseId),
      startDate: new Date(dto.startDate),
      endDate: endDate,
    });
    const savedGroup = await group.save();

    // Automatically generate the lesson schedule dates
    await this.generateLessonSchedule(savedGroup._id.toString());

    return savedGroup;
  }

  async findAll(): Promise<GroupDocument[]> {
    return this.groupModel.find().populate('courseId').exec();
  }

  async findOne(id: string): Promise<GroupDocument> {
    const group = await this.groupModel.findById(id).populate('courseId').populate('students').exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async updateGroup(id: string, dto: any): Promise<GroupDocument> {
    const updated = await this.groupModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Group not found');
    }

    // Re-generate schedule if start date or days change
    if (dto.startDate || dto.schedule) {
      await this.generateLessonSchedule(id);
    }

    return updated;
  }

  async removeGroup(id: string): Promise<GroupDocument> {
    const deleted = await this.groupModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Group not found');
    }
    // Clean up schedule
    await this.scheduleModel.deleteMany({ groupId: new Types.ObjectId(id) }).exec();
    return deleted;
  }

  async addStudentToGroup(groupId: string, studentId: string): Promise<GroupDocument> {
    const group = await this.groupModel.findByIdAndUpdate(
      groupId,
      { $addToSet: { students: new Types.ObjectId(studentId) } },
      { new: true }
    ).exec();
    if (!group) throw new NotFoundException('Group not found');

    // Link student profile to group and course
    await this.studentsService.updateStudent(studentId, {
      groupId: group._id.toString(),
      courseId: group.courseId.toString(),
    });

    return group;
  }

  async removeStudentFromGroup(groupId: string, studentId: string): Promise<GroupDocument> {
    const group = await this.groupModel.findByIdAndUpdate(
      groupId,
      { $pull: { students: new Types.ObjectId(studentId) } },
      { new: true }
    ).exec();
    if (!group) throw new NotFoundException('Group not found');

    // Clear group and course from student profile
    await this.studentsService.updateStudent(studentId, {
      groupId: '',
      courseId: '',
    });

    return group;
  }

  async getGroupSchedule(groupId: string): Promise<any[]> {
    const group = await this.groupModel.findById(groupId).exec();
    if (!group) return [];

    // Find modules of this group (with fallback to course modules)
    let modules = await this.moduleModel.find({ groupId: group._id }).sort({ order: 1 }).exec();
    if (modules.length === 0 && group.courseId) {
      modules = await this.moduleModel.find({ courseId: group.courseId, groupId: { $exists: false } }).sort({ order: 1 }).exec();
    }
    const moduleIds = modules.map((m) => m._id);

    const lessons = await this.lessonModel.find({ moduleId: { $in: moduleIds } }).exec();

    // Sort lessons by module order, then lesson order
    lessons.sort((a, b) => {
      const modA = modules.find((m) => m._id.toString() === a.moduleId.toString());
      const modB = modules.find((m) => m._id.toString() === b.moduleId.toString());
      const modOrderA = modA ? modA.order : 0;
      const modOrderB = modB ? modB.order : 0;
      if (modOrderA !== modOrderB) {
        return modOrderA - modOrderB;
      }
      return a.order - b.order;
    });

    const totalLessons = lessons.length;

    // Count existing schedule records
    const scheduleRecords = await this.scheduleModel
      .find({ groupId: new Types.ObjectId(groupId) })
      .exec();

    // Auto-regenerate if schedule count or ordering is stale
    let needsRegen = scheduleRecords.length !== totalLessons;
    if (!needsRegen) {
      const sortedRecords = [...scheduleRecords].sort((a, b) => a.order - b.order);
      for (let i = 0; i < totalLessons; i++) {
        if (sortedRecords[i]?.lessonId?.toString() !== lessons[i]._id.toString()) {
          needsRegen = true;
          break;
        }
      }
    }

    if (needsRegen && totalLessons > 0) {
      await this.generateLessonSchedule(groupId);
    }

    const records = await this.scheduleModel
      .find({ groupId: new Types.ObjectId(groupId) })
      .populate('lessonId', 'title order videoUrl')
      .sort({ order: 1 })
      .exec();

    return records.map((rec) => {
      const recObj = rec.toObject();
      const lesson = recObj.lessonId as any;
      return {
        _id: recObj._id,
        lessonId: lesson?._id?.toString() || recObj.lessonId?.toString() || '',
        lessonTitle: lesson?.title || 'Dars mavjud emas',
        lessonOrder: lesson?.order || recObj.order,
        scheduledDate: recObj.scheduledDate,
        order: recObj.order,
      };
    });
  }

  async getGroupProgress(groupId: string): Promise<any> {
    const group = await this.groupModel.findById(groupId).populate('courseId').exec();
    if (!group) throw new NotFoundException('Group not found');

    const courseId = (group.courseId as any)?._id || group.courseId;

    // 1. First try group-specific modules (created via LMS Builder for this group)
    //    If none found, fall back to course-level modules
    let modules = await this.moduleModel
      .find({ groupId: new Types.ObjectId(groupId) })
      .sort({ order: 1 })
      .exec();

    if (modules.length === 0 && courseId) {
      modules = await this.moduleModel
        .find({ courseId: new Types.ObjectId(courseId.toString()), groupId: { $exists: false } })
        .sort({ order: 1 })
        .exec();
    }

    const moduleIds = modules.map((m) => m._id);

    const lessons = await this.lessonModel
      .find({ moduleId: { $in: moduleIds } })
      .sort({ order: 1 })
      .exec();

    // Sort lessons globally by module.order then lesson.order
    lessons.sort((a, b) => {
      const modA = modules.find((m) => m._id.toString() === a.moduleId.toString());
      const modB = modules.find((m) => m._id.toString() === b.moduleId.toString());
      return (modA?.order ?? 0) - (modB?.order ?? 0) || a.order - b.order;
    });

    // 2. Student profiles in this group
    const StudentProfileModel = this.groupModel.db.model('StudentProfile');
    const studentProfiles = await StudentProfileModel
      .find({ groupId: new Types.ObjectId(groupId) })
      .populate('userId', 'fullName avatar')
      .exec();

    const studentIds = studentProfiles.map((s: any) => s._id);

    // 3. All lesson progress for these students
    const LessonProgressModel = this.groupModel.db.model('LessonProgress');
    const progressList = await LessonProgressModel.find({
      studentId: { $in: studentIds },
    }).exec();

    // 4. Build per-lesson quiz question details (for error analysis)
    const lessonMap = lessons.map((les: any) => ({
      _id: les._id.toString(),
      title: les.title,
      order: les.order,
      quiz: les.quiz || [],
      moduleId: les.moduleId.toString(),
    }));

    // 5. Build per-student progress map
    const students = studentProfiles.map((sp: any) => {
      const spObj = sp.toObject();
      const userId = spObj.userId;
      const spId = spObj._id.toString();

      const studentProgress = progressList
        .filter((p: any) => p.studentId.toString() === spId)
        .map((p: any) => ({
          lessonId: p.lessonId.toString(),
          completed: p.completed,
          practiceCompleted: p.practiceCompleted,
          testCompleted: p.testCompleted,
          score: p.score,
          quizAnswers: p.quizAnswers || [],
        }));

      return {
        _id: spId,
        userId: userId?._id || userId,
        fullName: userId?.fullName || 'Noma\'lum',
        avatar: userId?.avatar || null,
        progress: studentProgress,
      };
    });

    return {
      group: {
        _id: group._id,
        name: group.name,
        startLessonOrder: (group as any).startLessonOrder ?? 1,
        courseId: courseId,
        courseName: (group.courseId as any)?.name || '',
      },
      lessons: lessonMap,
      students,
    };
  }

  // Automatic Lesson Date Calculator
  async generateLessonSchedule(groupId: string): Promise<void> {
    const group = await this.groupModel.findById(groupId);
    if (!group) return;

    // 1. Fetch modules and lessons (handling custom group modules)
    let modules = await this.moduleModel.find({ groupId: group._id }).sort({ order: 1 }).exec();
    if (modules.length === 0 && group.courseId) {
      modules = await this.moduleModel.find({ courseId: group.courseId, groupId: { $exists: false } }).sort({ order: 1 }).exec();
    }
    const moduleIds = modules.map((m) => m._id);

    const lessons = await this.lessonModel.find({ moduleId: { $in: moduleIds } }).exec();

    if (lessons.length === 0) return;

    // Sort lessons by module order, then lesson order
    lessons.sort((a, b) => {
      const modA = modules.find((m) => m._id.toString() === a.moduleId.toString());
      const modB = modules.find((m) => m._id.toString() === b.moduleId.toString());
      const modOrderA = modA ? modA.order : 0;
      const modOrderB = modB ? modB.order : 0;
      if (modOrderA !== modOrderB) {
        return modOrderA - modOrderB;
      }
      return a.order - b.order;
    });

    // 2. Map lessons to schedule days
    let currentDate = new Date(group.startDate);
    let lessonIndex = 0;
    // Normalize stored day names to lowercase for comparison
    const daysOfWeek = group.schedule.days.map((d) => d.trim().toLowerCase());

    const getUtcDayName = (date: Date): string => {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return days[date.getUTCDay()];
    };

    // Wipe old schedules
    await this.scheduleModel.deleteMany({ groupId: group._id }).exec();

    // Simple loop: advance day-by-day and assign lesson if day matches schedule
    while (lessonIndex < lessons.length) {
      const dayName = getUtcDayName(currentDate);
      if (daysOfWeek.includes(dayName)) {
        const lesson = lessons[lessonIndex];
        const scheduleRecord = new this.scheduleModel({
          groupId: group._id,
          lessonId: lesson._id,
          scheduledDate: new Date(currentDate),
          order: lessonIndex + 1,
        });
        await scheduleRecord.save();
        lessonIndex++;
      }
      // Advance by one day in UTC to prevent timezone DST shifts
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
  }
}
