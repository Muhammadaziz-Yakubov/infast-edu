import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtraLessonSlot, ExtraLessonSlotSchema } from './schemas/extra-lesson-slot.schema';
import { ExtraLessonsService } from './extra-lessons.service';
import { ExtraLessonsController } from './extra-lessons.controller';
import { StudentsModule } from '../students/students.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExtraLessonSlot.name, schema: ExtraLessonSlotSchema },
    ]),
    StudentsModule,
    NotificationsModule,
  ],
  controllers: [ExtraLessonsController],
  providers: [ExtraLessonsService],
  exports: [ExtraLessonsService],
})
export class ExtraLessonsModule {}
