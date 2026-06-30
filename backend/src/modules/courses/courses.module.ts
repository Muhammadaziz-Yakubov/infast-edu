import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from './schemas/course.schema';
import { CourseModule, CourseModuleSchema } from '../lms/schemas/module.schema';
import { Lesson, LessonSchema } from '../lms/schemas/lesson.schema';
import { PracticeTask, PracticeTaskSchema } from '../lms/schemas/practice-task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CourseModule.name, schema: CourseModuleSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: PracticeTask.name, schema: PracticeTaskSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService, MongooseModule],
})
export class CoursesModule {}

