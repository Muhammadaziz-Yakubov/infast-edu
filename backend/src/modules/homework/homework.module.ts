import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HomeworkService } from './homework.service';
import { HomeworkController } from './homework.controller';
import { Homework, HomeworkSchema } from './schemas/homework.schema';
import { HomeworkSubmission, HomeworkSubmissionSchema } from './schemas/homework-submission.schema';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Homework.name, schema: HomeworkSchema },
      { name: HomeworkSubmission.name, schema: HomeworkSubmissionSchema },
    ]),
    StudentsModule,
  ],
  controllers: [HomeworkController],
  providers: [HomeworkService],
  exports: [HomeworkService, MongooseModule],
})
export class HomeworkModule {}
