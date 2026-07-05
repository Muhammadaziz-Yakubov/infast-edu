import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DemoLessonsService } from './demo-lessons.service';
import { DemoLessonsController } from './demo-lessons.controller';
import { DemoLesson, DemoLessonSchema } from './schemas/demo-lesson.schema';
import { LeadsModule } from '../leads/leads.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DemoLesson.name, schema: DemoLessonSchema },
    ]),
    LeadsModule,
    ActivitiesModule,
  ],
  controllers: [DemoLessonsController],
  providers: [DemoLessonsService],
  exports: [DemoLessonsService, MongooseModule],
})
export class DemoLessonsModule {}
