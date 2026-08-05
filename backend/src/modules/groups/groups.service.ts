import { Injectable, NotFoundException, ConflictException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { Role } from '../../common/enums/roles.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { GroupLessonSchedule, GroupLessonScheduleDocument } from './schemas/group-lesson-schedule.schema';
import { CourseModule, CourseModuleDocument } from '../lms/schemas/module.schema';
import { Lesson, LessonDocument } from '../lms/schemas/lesson.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { StudentsService } from '../students/students.service';
import { ChatService } from '../chat/chat.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { ScheduleGenerator } from './utils/schedule-generator.util';

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
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentsService: StudentsService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  async createGroup(dto: CreateGroupDto, user: any): Promise<GroupDocument> {
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

    let finalBranchId: Types.ObjectId | undefined = undefined;
    if (user.role === Role.BRANCH_ADMIN) {
      finalBranchId = new Types.ObjectId(user.branchId);
    } else if (user.role === Role.SUPER_ADMIN) {
      finalBranchId = undefined; // Super Admin groups belong to main branch
    } else if (dto.branchId) {
      finalBranchId = new Types.ObjectId(dto.branchId);
    }

    const group = new this.groupModel({
      ...dto,
      courseId: new Types.ObjectId(dto.courseId),
      startDate: new Date(dto.startDate),
      endDate: endDate,
      branchId: finalBranchId,
    });
    const savedGroup = await group.save();

    // Automatically generate the lesson schedule dates
    await this.generateLessonSchedule(savedGroup._id.toString());

    // Auto-create group chat room
    try {
      await this.chatService.createGroupRoom(
        savedGroup._id.toString(),
        savedGroup.name,
        [], // students join when enrolled
      );
    } catch (e) {
      console.error('Failed to create group chat room:', e.message);
    }

    return savedGroup;
  }

  async findAll(user: any, targetBranchId?: string): Promise<GroupDocument[]> {
    let filter = {};
    if (user.role === Role.BRANCH_ADMIN) {
      filter = { branchId: new Types.ObjectId(user.branchId) };
    } else if (user.role === Role.SUPER_ADMIN) {
      if (targetBranchId) {
        filter = { branchId: new Types.ObjectId(targetBranchId) };
      } else {
        filter = { branchId: { $in: [null, undefined] } };
      }
    }
    return this.groupModel.find(filter).populate('courseId').exec();
  }

  async findOne(id: string, user: any): Promise<GroupDocument> {
    const group = await this.groupModel.findById(id).populate('courseId').populate('students').exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (user.role === Role.BRANCH_ADMIN && (!group.branchId || group.branchId.toString() !== user.branchId)) {
      throw new ForbiddenException('You do not have access to this group');
    }

    return group;
  }

  async updateGroup(id: string, dto: any, user: any): Promise<GroupDocument> {
    const group = await this.groupModel.findById(id).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (user.role === Role.BRANCH_ADMIN && (!group.branchId || group.branchId.toString() !== user.branchId)) {
      throw new ForbiddenException('You do not have access to this group');
    }

    // If SUPER_ADMIN, allow changing branchId
    const updateData = { ...dto };
    if (dto.branchId !== undefined) {
      updateData.branchId = dto.branchId ? new Types.ObjectId(dto.branchId) : null;
    }

    const updated = await this.groupModel
      .findByIdAndUpdate(id, updateData, { new: true })
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

  async removeGroup(id: string, user: any): Promise<GroupDocument> {
    const group = await this.groupModel.findById(id).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (user.role === Role.BRANCH_ADMIN && (!group.branchId || group.branchId.toString() !== user.branchId)) {
      throw new ForbiddenException('You do not have access to this group');
    }

    const deleted = await this.groupModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Group not found');
    }
    // Clean up schedule
    await this.scheduleModel.deleteMany({ groupId: new Types.ObjectId(id) }).exec();
    return deleted;
  }

  async addStudentToGroup(groupId: string, studentId: string, user: any): Promise<GroupDocument> {
    const group = await this.groupModel.findById(groupId).exec();
    if (!group) throw new NotFoundException('Group not found');

    if (user.role === Role.BRANCH_ADMIN && (!group.branchId || group.branchId.toString() !== user.branchId)) {
      throw new ForbiddenException('You do not have access to this group');
    }

    // Check if student belongs to same branch
    const student = await this.userModel.findById(studentId).exec();
    if (!student) throw new NotFoundException('Student not found');
    if (user.role === Role.BRANCH_ADMIN && student.branchId?.toString() !== user.branchId) {
      throw new ForbiddenException('Student does not belong to your branch');
    }

    group.students = group.students || [];
    if (!group.students.map(s => s.toString()).includes(studentId)) {
      group.students.push(new Types.ObjectId(studentId));
      await group.save();
    }

    // Link student profile to group and course
    await this.studentsService.updateStudent(studentId, {
      groupId: group._id.toString(),
      courseId: group.courseId.toString(),
    }, user);

    // Auto-add student to group chat room
    try {
      await this.chatService.addParticipant(groupId, studentId);
    } catch (e) {
      console.error('Failed to add student to group chat:', e.message);
    }

    return group;
  }

  async removeStudentFromGroup(groupId: string, studentId: string, user: any): Promise<GroupDocument> {
    const group = await this.groupModel.findById(groupId).exec();
    if (!group) throw new NotFoundException('Group not found');

    if (user.role === Role.BRANCH_ADMIN && (!group.branchId || group.branchId.toString() !== user.branchId)) {
      throw new ForbiddenException('You do not have access to this group');
    }

    group.students = (group.students || []).filter(s => s.toString() !== studentId);
    await group.save();

    // Clear group and course from student profile
    await this.studentsService.updateStudent(studentId, {
      groupId: '',
      courseId: '',
    }, user);

    // Remove student from group chat room
    try {
      await this.chatService.removeParticipant(groupId, studentId);
    } catch (e) {
      console.error('Failed to remove student from group chat:', e.message);
    }

    return group;
  }

  async getGroupSchedule(groupId: string, user: any, studentId?: string): Promise<any[]> {
    const group = await this.groupModel.findById(groupId).exec();
    if (!group) return [];

    if (user.role === Role.BRANCH_ADMIN && (!group.branchId || group.branchId.toString() !== user.branchId)) {
      throw new ForbiddenException('You do not have access to this group');
    }

    const effectiveStudentId = studentId || (user.role === 'STUDENT' ? user.sub : null);
    let targetCourseId = group.courseId;
    let completedLessonIds = new Set<string>();

    if (effectiveStudentId) {
      const StudentProfileModel = this.moduleModel.db.model('StudentProfile');
      const profile = await StudentProfileModel.findOne({ userId: new Types.ObjectId(effectiveStudentId) }).exec();

      if (profile && profile.courseId) {
        targetCourseId = profile.courseId;
      }

      const LessonProgressModel = this.moduleModel.db.model('LessonProgress');
      const progressRecords = await LessonProgressModel.find({
        studentId: new Types.ObjectId(effectiveStudentId),
        completed: true,
      }).exec();

      completedLessonIds = new Set(progressRecords.map((p: any) => p.lessonId.toString()));
    }

    // 1. Fetch modules for target course (or group-specific modules)
    let modules = await this.moduleModel.find({ groupId: group._id }).sort({ order: 1 }).exec();
    if (modules.length === 0 && targetCourseId) {
      const courseObjId = (targetCourseId as any)?._id || targetCourseId;
      const validCourseId = typeof courseObjId === 'string' ? new Types.ObjectId(courseObjId) : courseObjId;
      modules = await this.moduleModel
        .find({ courseId: validCourseId, $or: [{ groupId: { $exists: false } }, { groupId: null }] })
        .sort({ order: 1 })
        .exec();
    }

    const moduleIds = modules.map((m) => m._id);
    const lessons = await this.lessonModel.find({ moduleId: { $in: moduleIds } }).exec();

    // Sort lessons globally by module order then lesson order
    lessons.sort((a, b) => {
      const modA = modules.find((m) => m._id.toString() === a.moduleId.toString());
      const modB = modules.find((m) => m._id.toString() === b.moduleId.toString());
      const modOrderA = modA ? modA.order : 0;
      const modOrderB = modB ? modB.order : 0;
      if (modOrderA !== modOrderB) return modOrderA - modOrderB;
      return a.order - b.order;
    });

    if (lessons.length === 0) return [];

    // 2. Generate dynamic schedule dates using ScheduleGenerator
    const days = group.schedule?.days || [];
    const generatedDates = ScheduleGenerator.generateDates(group.startDate, days, lessons.length);

    // 3. Determine next lesson order (completed lessons count + 1)
    let completedCount = 0;
    for (let i = 0; i < lessons.length; i++) {
      if (completedLessonIds.has(lessons[i]._id.toString())) {
        completedCount++;
      }
    }
    const nextLessonOrder = completedCount + 1;

    // 4. Return dynamic schedule array
    return lessons.map((lesson, idx) => {
      const order = idx + 1;
      const dateInfo = generatedDates[idx];
      const isCompleted = completedLessonIds.has(lesson._id.toString());
      const isNext = order === nextLessonOrder;

      return {
        _id: lesson._id.toString(),
        lessonId: lesson._id.toString(),
        lessonTitle: lesson.title || `Dars #${order}`,
        lessonOrder: lesson.order || order,
        scheduledDate: dateInfo ? dateInfo.date : new Date(),
        formattedDate: dateInfo ? dateInfo.formattedDate : '',
        order: order,
        courseId: targetCourseId.toString(),
        isCompleted: isCompleted,
        isNext: isNext,
      };
    });
  }

  async getGroupProgress(groupId: string, user: any): Promise<any> {
    const group = await this.groupModel.findById(groupId).populate('courseId').exec();
    if (!group) throw new NotFoundException('Group not found');

    if (user.role === Role.BRANCH_ADMIN && (!group.branchId || group.branchId.toString() !== user.branchId)) {
      throw new ForbiddenException('You do not have access to this group');
    }

    const courseId = (group.courseId as any)?._id || group.courseId;

    // 1. First try group-specific modules (created via LMS Builder for this group)
    //    If none found, fall back to course-level modules
    let modules = await this.moduleModel
      .find({ groupId: new Types.ObjectId(groupId) })
      .sort({ order: 1 })
      .exec();

    if (modules.length === 0 && courseId) {
      const validCourseId = typeof courseId === 'string' ? new Types.ObjectId(courseId) : (courseId as any)._id || courseId;
      modules = await this.moduleModel
        .find({ courseId: new Types.ObjectId(validCourseId.toString()), $or: [{ groupId: { $exists: false } }, { groupId: null }] })
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
      .populate('userId', 'fullName avatar label')
      .exec();

    const userIds = studentProfiles
      .map((s: any) => s.userId?._id || s.userId)
      .filter((id) => id != null);

    // 3. All lesson progress for these students
    const LessonProgressModel = this.groupModel.db.model('LessonProgress');
    const progressList = await LessonProgressModel.find({
      studentId: { $in: userIds },
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
      const uId = (userId?._id || userId)?.toString() || '';

      const studentProgress = progressList
        .filter((p: any) => p.studentId.toString() === uId)
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
        userId: uId,
        fullName: userId?.fullName || 'Noma\'lum',
        avatar: userId?.avatar || null,
        label: userId?.label || '',
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

  // Automatic Lesson Date Calculator / Cache Sync
  async generateLessonSchedule(groupId: string): Promise<void> {
    const group = await this.groupModel.findById(groupId);
    if (!group) return;

    let modules = await this.moduleModel.find({ groupId: group._id }).sort({ order: 1 }).exec();
    if (modules.length === 0 && group.courseId) {
      const courseObjId = (group.courseId as any)?._id || group.courseId;
      const validCourseId = typeof courseObjId === 'string' ? new Types.ObjectId(courseObjId) : courseObjId;
      modules = await this.moduleModel
        .find({ courseId: validCourseId, $or: [{ groupId: { $exists: false } }, { groupId: null }] })
        .sort({ order: 1 })
        .exec();
    }
    const moduleIds = modules.map((m) => m._id);
    const lessons = await this.lessonModel.find({ moduleId: { $in: moduleIds } }).exec();
    if (lessons.length === 0) return;

    lessons.sort((a, b) => {
      const modA = modules.find((m) => m._id.toString() === a.moduleId.toString());
      const modB = modules.find((m) => m._id.toString() === b.moduleId.toString());
      return (modA?.order ?? 0) - (modB?.order ?? 0) || a.order - b.order;
    });

    const generatedDates = ScheduleGenerator.generateDates(group.startDate, group.schedule?.days || [], lessons.length);

    await this.scheduleModel.deleteMany({ groupId: group._id }).exec();
    const records = generatedDates.map((d, idx) => ({
      groupId: group._id,
      lessonId: lessons[idx]._id,
      scheduledDate: d.date,
      order: d.order,
    }));

    if (records.length > 0) {
      await this.scheduleModel.insertMany(records);
    }
  }
}
