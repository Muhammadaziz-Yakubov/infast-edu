import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Homework, HomeworkDocument } from './schemas/homework.schema';
import { HomeworkSubmission, HomeworkSubmissionDocument } from './schemas/homework-submission.schema';
import { LessonProgress, LessonProgressDocument } from '../lms/schemas/lesson-progress.schema';
import { StudentsService } from '../students/students.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectModel(Homework.name)
    private readonly homeworkModel: Model<HomeworkDocument>,
    @InjectModel(HomeworkSubmission.name)
    private readonly submissionModel: Model<HomeworkSubmissionDocument>,
    @InjectModel(LessonProgress.name)
    private readonly progressModel: Model<LessonProgressDocument>,
    private readonly studentsService: StudentsService
  ) {}

  async createHomework(dto: CreateHomeworkDto): Promise<HomeworkDocument> {
    const existing = await this.homeworkModel.findOne({ lessonId: new Types.ObjectId(dto.lessonId) });
    if (existing) {
      throw new ConflictException('Homework already exists for this lesson');
    }
    const homework = new this.homeworkModel({
      ...dto,
      lessonId: new Types.ObjectId(dto.lessonId),
    });
    return homework.save();
  }

  async findHomeworkByLesson(lessonId: string): Promise<HomeworkDocument> {
    const homework = await this.homeworkModel.findOne({ lessonId: new Types.ObjectId(lessonId) }).exec();
    if (!homework) {
      throw new NotFoundException('Homework not found for this lesson');
    }
    return homework;
  }

  async findHomeworkById(id: string): Promise<HomeworkDocument> {
    const homework = await this.homeworkModel.findById(id).exec();
    if (!homework) {
      throw new NotFoundException('Homework not found');
    }
    return homework;
  }

  async submitHomework(studentId: string, homeworkId: string, dto: SubmitHomeworkDto): Promise<any> {
    const homework = await this.findHomeworkById(homeworkId);

    // Check if already submitted
    const existingSubmission = await this.submissionModel.findOne({
      studentId: new Types.ObjectId(studentId),
      homeworkId: new Types.ObjectId(homeworkId),
    });

    if (existingSubmission) {
      throw new ConflictException('You have already submitted this homework.');
    }

    const { answers } = dto;
    if (answers.length !== homework.tasks.length) {
      throw new BadRequestException('All tasks in the homework must be answered');
    }

    // Grade homework submission
    let correctCount = 0;
    homework.tasks.forEach((task) => {
      const studentAnswer = answers.find((ans) => ans.taskId === task.id);
      if (studentAnswer && studentAnswer.answer.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase()) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / homework.tasks.length) * 100);

    // Calculate dynamic XP and Coins proportional to score
    const xpAwarded = Math.round((score / 100) * homework.xpReward);
    const coinAwarded = Math.round((score / 100) * homework.coinReward);

    const submission = new this.submissionModel({
      studentId: new Types.ObjectId(studentId),
      homeworkId: new Types.ObjectId(homeworkId),
      answers,
      score,
      completedAt: new Date(),
    });
    await submission.save();

    // ── Mark practice step as completed on lesson progress ──
    await this.progressModel.findOneAndUpdate(
      {
        studentId: new Types.ObjectId(studentId),
        lessonId: homework.lessonId,
      },
      { $set: { practiceCompleted: true } },
      { upsert: true, new: true }
    ).exec();

    // Award rewards to student profile
    if (xpAwarded > 0 || coinAwarded > 0) {
      await this.studentsService.addXpAndCoins(studentId, xpAwarded, coinAwarded);
    }

    // Update overall homework progress (re-calculate student homework progress percentage)
    await this.recalculateStudentHomeworkProgress(studentId);

    return {
      submission,
      score,
      xpAwarded,
      coinAwarded,
      practiceCompleted: true,
    };
  }

  async getSubmission(studentId: string, homeworkId: string): Promise<HomeworkSubmissionDocument | null> {
    return this.submissionModel.findOne({
      studentId: new Types.ObjectId(studentId),
      homeworkId: new Types.ObjectId(homeworkId),
    }).exec();
  }

  async getSubmissionsForHomework(homeworkId: string): Promise<HomeworkSubmissionDocument[]> {
    return this.submissionModel
      .find({ homeworkId: new Types.ObjectId(homeworkId) })
      .populate('studentId', 'fullName email phone label')
      .exec();
  }

  async findAllSubmissions(): Promise<any[]> {
    const submissions = await this.submissionModel
      .find()
      .populate('studentId', 'fullName email phone label')
      .populate('homeworkId', 'title')
      .exec();

    return submissions.map((sub) => {
      const subObj = sub.toObject() as any;
      return {
        _id: subObj._id,
        studentId: subObj.studentId?._id || subObj.studentId,
        studentName: subObj.studentId?.fullName || 'Noma\'lum Talaba',
        studentLabel: subObj.studentId?.label || '',
        homeworkTitle: subObj.homeworkId?.title || 'Noma\'lum Topshiriq',
        completedAt: subObj.completedAt || subObj.createdAt || new Date(),
        score: subObj.score,
        status: 'GRADED',
        answers: subObj.answers,
      };
    });
  }

  async gradeSubmission(submissionId: string, score: number): Promise<any> {
    const submission = await this.submissionModel.findById(submissionId).exec();
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    submission.score = score;
    return submission.save();
  }

  private async recalculateStudentHomeworkProgress(studentId: string): Promise<void> {
    // Calculate total homeworks vs completed submissions
    const totalHomeworksCount = await this.homeworkModel.countDocuments().exec();
    if (totalHomeworksCount === 0) return;

    const completedSubmissionsCount = await this.submissionModel.countDocuments({
      studentId: new Types.ObjectId(studentId),
    }).exec();

    const progressPercentage = Math.round((completedSubmissionsCount / totalHomeworksCount) * 100);
    await this.studentsService.updateHomeworkProgress(studentId, progressPercentage);
  }
}

