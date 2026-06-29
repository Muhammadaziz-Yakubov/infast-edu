import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourseModule, CourseModuleDocument } from './schemas/module.schema';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { LessonProgress, LessonProgressDocument } from './schemas/lesson-progress.schema';
import { Story, StoryDocument } from './schemas/story.schema';
import { StudentsService } from '../students/students.service';

@Injectable()
export class LmsService implements OnModuleInit {
  constructor(
    @InjectModel(CourseModule.name)
    private readonly moduleModel: Model<CourseModuleDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(LessonProgress.name)
    private readonly progressModel: Model<LessonProgressDocument>,
    @InjectModel(Story.name)
    private readonly storyModel: Model<StoryDocument>,
    @Inject(forwardRef(() => StudentsService))
    private readonly studentsService: StudentsService
  ) { }

  async onModuleInit() {
    const count = await this.storyModel.countDocuments().exec();
    if (count === 0) {
      await this.storyModel.create([
        {
          title: 'INTRODUCTORY VIDEO',
          mediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600',
          mediaType: 'IMAGE',
          duration: 8,
        },
        {
          title: 'PREPAYMENT',
          mediaUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600',
          mediaType: 'IMAGE',
          duration: 10,
        },
        {
          title: 'IELTS EXAM',
          mediaUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600',
          mediaType: 'IMAGE',
          duration: 7,
        },
      ]);
    }
  }

  // Modules CRUD
  async createModule(dto: any): Promise<CourseModuleDocument> {
    let order = dto.order;
    if (order === undefined || order === null) {
      const count = await this.moduleModel.countDocuments({ courseId: new Types.ObjectId(dto.courseId) }).exec();
      order = count + 1;
    }
    const newModule = new this.moduleModel({
      ...dto,
      order,
      courseId: new Types.ObjectId(dto.courseId),
    });
    return newModule.save();
  }

  async findModulesByCourse(courseId: string): Promise<any[]> {
    const modules = await this.moduleModel.find({ courseId: new Types.ObjectId(courseId) }).sort({ order: 1 }).exec();
    const result = [];
    for (const mod of modules) {
      const lessons = await this.lessonModel.find({ moduleId: mod._id }).sort({ order: 1 }).exec();
      result.push({
        ...mod.toObject(),
        lessons,
      });
    }
    return result;
  }

  async updateModule(id: string, dto: any): Promise<CourseModuleDocument> {
    const updated = await this.moduleModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Module not found');
    return updated;
  }

  async removeModule(id: string): Promise<CourseModuleDocument> {
    const deleted = await this.moduleModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Module not found');
    // Clean up lessons in module
    await this.lessonModel.deleteMany({ moduleId: new Types.ObjectId(id) }).exec();
    return deleted;
  }

  // Lessons CRUD
  async createLesson(dto: any): Promise<LessonDocument> {
    let order = dto.order;
    if (order === undefined || order === null) {
      const count = await this.lessonModel.countDocuments({ moduleId: new Types.ObjectId(dto.moduleId) }).exec();
      order = count + 1;
    }
    const newLesson = new this.lessonModel({
      ...dto,
      order,
      moduleId: new Types.ObjectId(dto.moduleId),
    });
    return newLesson.save();
  }

  async findLessonsByModule(moduleId: string): Promise<LessonDocument[]> {
    return this.lessonModel.find({ moduleId: new Types.ObjectId(moduleId) }).sort({ order: 1 }).exec();
  }

  async findOneLesson(id: string): Promise<LessonDocument> {
    const lesson = await this.lessonModel.findById(id).exec();
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async updateLesson(id: string, dto: any): Promise<LessonDocument> {
    const updated = await this.lessonModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Lesson not found');
    return updated;
  }

  async removeLesson(id: string): Promise<LessonDocument> {
    const deleted = await this.lessonModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Lesson not found');
    // Clean up student progress logs
    await this.progressModel.deleteMany({ lessonId: new Types.ObjectId(id) }).exec();
    return deleted;
  }

  // Lesson Progress / Quiz Completion
  async completeLesson(studentId: string, lessonId: string, quizAnswers?: number[], completedRounds?: number): Promise<any> {
    const lesson = await this.findOneLesson(lessonId);
    let score = 0;
    let perfectScoreBonus = false;

    // Find or create progress
    let progress = await this.progressModel.findOne({
      studentId: new Types.ObjectId(studentId),
      lessonId: new Types.ObjectId(lessonId),
    });

    if (!progress) {
      progress = new this.progressModel({
        studentId: new Types.ObjectId(studentId),
        lessonId: new Types.ObjectId(lessonId),
      });
    }

    const isFirstTimeCompletion = !progress.completed;

    if (quizAnswers) {
      progress.quizAnswers = quizAnswers;
    }
    if (completedRounds !== undefined) {
      progress.completedRounds = completedRounds;
    }

    const quizList = lesson.quiz ?? [];
    const hasQuiz = quizList.length > 0;
    
    // Determine total rounds count from quiz questions
    const rounds = new Set(quizList.map(q => q.round || 1));
    const totalRoundsCount = rounds.size;
    const isLastRoundCompleted = completedRounds !== undefined && completedRounds >= totalRoundsCount;

    const allQuestionsAnswered = hasQuiz && (
      isLastRoundCompleted || (
        quizAnswers &&
        quizAnswers.length === quizList.length &&
        quizAnswers.every((ans) => ans !== null && ans !== undefined)
      )
    );

    let passed = false;
    if (hasQuiz) {
      if (allQuestionsAnswered) {
        let correctCount = 0;
        quizList.forEach((q, idx) => {
          if (quizAnswers && idx < quizAnswers.length && q.correctAnswerIndex === quizAnswers[idx]) {
            correctCount++;
          }
        });

        score = Math.round((correctCount / quizList.length) * 100);
        if (correctCount === quizList.length) {
          perfectScoreBonus = true;
        }
        passed = score >= 80;
      } else {
        passed = false;
      }
    } else {
      passed = true;
    }

    // Lesson is "completed" as long as student submitted all answers (any score)
    // "passed" (score>=80) only gates XP/coin rewards
    const isSubmitted = allQuestionsAnswered || !hasQuiz;
    progress.completed = isSubmitted;
    if (allQuestionsAnswered) {
      progress.score = score;
    }
    if (isSubmitted) {
      progress.completionDate = new Date();
    }
    await progress.save();

    // ── Reward student on first-time completion, scaled by score ──
    // Formula:
    //   base XP  = 20 (just for submitting)
    //   score XP = score points (0–100), i.e. 1 XP per percentage point
    //   perfect  = +50 XP bonus if all answers correct
    //   coins    = score / 5  (0–20 coins), +10 bonus on perfect
    let xpEarned = 0;
    let coinsEarned = 0;

    if (isFirstTimeCompletion && isSubmitted) {
      if (!hasQuiz) {
        // No quiz lesson: flat reward
        xpEarned = 50;
        coinsEarned = 10;
      } else if (allQuestionsAnswered) {
        xpEarned = 20 + score;             // base 20 + up to 100 score XP
        coinsEarned = Math.round(score / 5); // up to 20 coins

        if (perfectScoreBonus) {
          xpEarned += 50;   // perfect-score bonus
          coinsEarned += 10; // perfect-score coin bonus
        }
      }

      if (xpEarned > 0 || coinsEarned > 0) {
        await this.studentsService.addXpAndCoins(studentId, xpEarned, coinsEarned);
      }
    }

    return {
      progress,
      passed,
      perfectScoreBonus,
      score,
      xpEarned,
      coinsEarned,
    };
  }

  async getLessonProgress(studentId: string, lessonId: string): Promise<LessonProgressDocument | null> {
    return this.progressModel.findOne({
      studentId: new Types.ObjectId(studentId),
      lessonId: new Types.ObjectId(lessonId),
    }).exec();
  }

  async getCourseProgress(studentId: string, courseId: string): Promise<any> {
    // 1. Get all modules for course
    const modules = await this.findModulesByCourse(courseId);
    const moduleIds = modules.map((m) => m._id);

    // 2. Get all lessons in these modules
    const lessons = await this.lessonModel.find({ moduleId: { $in: moduleIds } }).exec();
    const lessonIds = lessons.map((l) => l._id);

    if (lessons.length === 0) {
      return {
        completedLessonsCount: 0,
        totalLessonsCount: 0,
        completionPercentage: 0,
        averageQuizScore: 0,
        lessons: [],
      };
    }

    // 3. Get completed lesson progress for student
    const progressList = await this.progressModel.find({
      studentId: new Types.ObjectId(studentId),
      lessonId: { $in: lessonIds },
      completed: true,
    }).exec();

    const completedLessonIds = progressList.map((p) => p.lessonId.toString());
    const scoreSum = progressList.reduce((sum, p) => sum + (p.score || 0), 0);

    const completedLessonsCount = progressList.length;
    const totalLessonsCount = lessons.length;
    const completionPercentage = Math.round((completedLessonsCount / totalLessonsCount) * 100);
    const averageQuizScore = completedLessonsCount > 0 ? Math.round(scoreSum / completedLessonsCount) : 0;

    return {
      completedLessonsCount,
      totalLessonsCount,
      completionPercentage,
      averageQuizScore,
      progress: progressList,
    };
  }

  async getGroupGrades(groupId: string): Promise<any> {
    // 1. Find all student profiles in the group
    const studentProfiles = await this.progressModel.db.model('StudentProfile')
      .find({ groupId: new Types.ObjectId(groupId) })
      .populate('userId', 'fullName avatar')
      .exec();

    // 2. Fetch all lesson progress logs for all these student IDs
    const studentIds = studentProfiles.map(s => s._id);
    const progressList = await this.progressModel.find({
      studentId: { $in: studentIds }
    }).exec();

    const studentsWithStatus = await Promise.all(
      studentProfiles.map(async (s) => {
        const sObj = s.toObject();
        const userId = sObj.userId?._id || sObj.userId;
        const dynamicStatus = await this.studentsService.calculateStudentPaymentStatus(userId);
        return {
          _id: sObj._id,
          userId: sObj.userId,
          xp: sObj.xp,
          coins: sObj.coins,
          paymentStatus: dynamicStatus,
        };
      })
    );

    return {
      students: studentsWithStatus,
      progress: progressList.map(p => {
        const pObj = p.toObject();
        return {
          studentId: pObj.studentId,
          lessonId: pObj.lessonId,
          completed: pObj.completed,
          score: pObj.score,
        };
      })
    };
  }

  // ── Stories System ──

  async findStories(userId: string): Promise<any[]> {
    const stories = await this.storyModel.find().sort({ createdAt: -1 }).exec();
    return stories.map((story) => {
      const sObj = story.toObject() as any;
      sObj.likesCount = story.likes ? story.likes.length : 0;
      sObj.likedByMe = story.likes ? story.likes.some((id) => id.toString() === userId.toString()) : false;
      sObj.viewedByMe = story.viewers ? story.viewers.some((id) => id.toString() === userId.toString()) : false;
      return sObj;
    });
  }

  async createStory(dto: any): Promise<StoryDocument> {
    const newStory = new this.storyModel({
      ...dto,
      likes: [],
      viewers: [],
    });
    return newStory.save();
  }

  async toggleLikeStory(storyId: string, userId: string): Promise<any> {
    const story = await this.storyModel.findById(storyId);
    if (!story) throw new NotFoundException('Story not found');

    const userObjId = new Types.ObjectId(userId);
    const index = story.likes.findIndex((id) => id.toString() === userId.toString());
    let liked = false;
    
    if (index === -1) {
      story.likes.push(userObjId);
      liked = true;
    } else {
      story.likes.splice(index, 1);
      liked = false;
    }
    await story.save();

    return {
      liked,
      likesCount: story.likes.length,
    };
  }

  async viewStory(storyId: string, userId: string): Promise<any> {
    const story = await this.storyModel.findById(storyId);
    if (!story) throw new NotFoundException('Story not found');

    const userObjId = new Types.ObjectId(userId);
    if (!story.viewers.some((id) => id.toString() === userId.toString())) {
      story.viewers.push(userObjId);
      await story.save();
    }
    return { success: true };
  }

  async deleteStory(storyId: string): Promise<StoryDocument> {
    const deleted = await this.storyModel.findByIdAndDelete(storyId).exec();
    if (!deleted) throw new NotFoundException('Story not found');
    return deleted;
  }
}
