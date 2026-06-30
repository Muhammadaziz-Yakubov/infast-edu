import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LmsService } from './lms.service';
import { LmsController } from './lms.controller';
import { CourseModule, CourseModuleSchema } from './schemas/module.schema';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { LessonProgress, LessonProgressSchema } from './schemas/lesson-progress.schema';
import { Story, StorySchema } from './schemas/story.schema';
import { PracticeTask, PracticeTaskSchema } from './schemas/practice-task.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseModule.name, schema: CourseModuleSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: Story.name, schema: StorySchema },
      { name: PracticeTask.name, schema: PracticeTaskSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
    forwardRef(() => StudentsModule),
  ],
  controllers: [LmsController],
  providers: [LmsService],
  exports: [LmsService, MongooseModule],
})
export class LmsModule {}
