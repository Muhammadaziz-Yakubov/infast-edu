import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseModule, CourseModuleDocument } from '../lms/schemas/module.schema';
import { Lesson, LessonDocument } from '../lms/schemas/lesson.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
    @InjectModel(CourseModule.name) private readonly moduleModel: Model<CourseModuleDocument>,
    @InjectModel(Lesson.name) private readonly lessonModel: Model<LessonDocument>
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    const newCourse = new this.courseModel({
      ...createCourseDto,
      totalLessons: createCourseDto.totalLessons ?? 0,
    });
    return newCourse.save();
  }

  async findAll(): Promise<any[]> {
    const courses = await this.courseModel.find().exec();
    
    return Promise.all(
      courses.map(async (course) => {
        const courseObj = course.toObject();
        
        // Find modules of this course
        const modules = await this.moduleModel
          .find({ courseId: course._id })
          .sort({ order: 1 })
          .exec();
          
        // Find lessons for each module
        const modulesWithLessons = await Promise.all(
          modules.map(async (mod) => {
            const modObj = mod.toObject();
            const lessons = await this.lessonModel
              .find({ moduleId: mod._id })
              .sort({ order: 1 })
              .exec();
            return {
              ...modObj,
              lessons,
            };
          })
        );
        
        return {
          ...courseObj,
          modules: modulesWithLessons,
        };
      })
    );
  }

  async findOne(id: string): Promise<any> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    
    const courseObj = course.toObject();
    
    // Find modules of this course
    const modules = await this.moduleModel
      .find({ courseId: course._id })
      .sort({ order: 1 })
      .exec();
      
    // Find lessons for each module
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const modObj = mod.toObject();
        const lessons = await this.lessonModel
          .find({ moduleId: mod._id })
          .sort({ order: 1 })
          .exec();
        return {
          ...modObj,
          lessons,
        };
      })
    );
    
    return {
      ...courseObj,
      modules: modulesWithLessons,
    };
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<CourseDocument> {
    const updated = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Course not found');
    }
    return updated;
  }

  async remove(id: string): Promise<CourseDocument> {
    const deleted = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Course not found');
    }
    return deleted;
  }

  async updateCourseModules(courseId: string, modules: any[]): Promise<void> {
    const moduleModel = this.courseModel.db.model('CourseModule');
    const lessonModel = this.courseModel.db.model('Lesson');

    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
      const mod = modules[mIdx];
      await moduleModel.findByIdAndUpdate(mod._id, { order: mIdx + 1 }).exec();

      if (mod.lessons && Array.isArray(mod.lessons)) {
        for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
          const les = mod.lessons[lIdx];
          await lessonModel.findByIdAndUpdate(les._id, {
            order: lIdx + 1,
            moduleId: new Types.ObjectId(mod._id)
          }).exec();
        }
      }
    }
  }

  async importCourse(importData: any): Promise<CourseDocument> {
    if (!importData || typeof importData !== 'object') {
      throw new BadRequestException('JSON ma\'lumotlar xato formatda');
    }

    const { title, description, price, duration, level, status, thumbnail, modules } = importData;
    
    if (!title || !description || !duration || !level) {
      throw new BadRequestException('Kursning majburiy maydonlari to\'ldirilmagan: title, description, duration, level');
    }

    let totalLessons = 0;
    if (modules && Array.isArray(modules)) {
      for (const mod of modules) {
        if (mod.lessons && Array.isArray(mod.lessons)) {
          totalLessons += mod.lessons.length;
        }
      }
    }

    try {
      // Create course
      const newCourse = new this.courseModel({
        title,
        description,
        price: price ?? 0,
        duration,
        level,
        status: status || 'DRAFT',
        thumbnail: thumbnail || '',
        totalLessons,
      });
      const savedCourse = await newCourse.save();

      // Create modules and lessons
      if (modules && Array.isArray(modules)) {
        for (let mIdx = 0; mIdx < modules.length; mIdx++) {
          const modData = modules[mIdx];
          if (!modData.title) {
            throw new BadRequestException(`Modul #${mIdx + 1} uchun nom kiritilmagan`);
          }

          const newModule = new this.moduleModel({
            title: modData.title,
            order: mIdx + 1,
            courseId: savedCourse._id,
          });
          const savedModule = await newModule.save();

          if (modData.lessons && Array.isArray(modData.lessons)) {
            for (let lIdx = 0; lIdx < modData.lessons.length; lIdx++) {
              const lesData = modData.lessons[lIdx];
              if (!lesData.title) {
                throw new BadRequestException(`Modul "${modData.title}" ichidagi dars #${lIdx + 1} uchun nom kiritilmagan`);
              }

              const formattedQuizzes = (lesData.quiz || []).map((q: any) => ({
                question: q.question,
                options: q.options || [],
                correctAnswerIndex: q.correctAnswerIndex ?? 0,
                round: q.round || 1,
              }));

              const newLesson = new this.lessonModel({
                title: lesData.title,
                description: lesData.description || '',
                videoUrl: lesData.videoUrl || '',
                order: lIdx + 1,
                moduleId: savedModule._id,
                textContent: lesData.textContent || '',
                practiceTasks: lesData.practiceTasks || [],
                quiz: formattedQuizzes,
              });
              await newLesson.save();
            }
          }
        }
      }

      return this.findOne(savedCourse._id.toString());
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(`Import qilishda xatolik yuz berdi: ${err.message}`);
    }
  }
}
