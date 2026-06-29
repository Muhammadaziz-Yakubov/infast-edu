import { Injectable, NotFoundException } from '@nestjs/common';
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
}
