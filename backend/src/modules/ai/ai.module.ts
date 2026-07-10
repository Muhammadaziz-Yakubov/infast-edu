import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GroqService } from './groq.service';
import { LessonGeneratorService } from './lesson-generator.service';
import { ChatService } from './chat.service';
import { AiChat, AiChatSchema } from './schemas/ai-chat.schema';
import { LmsModule } from '../lms/lms.module';
import { HomeworkModule } from '../homework/homework.module';
import { CoursesModule } from '../courses/courses.module';
import { StudentsModule } from '../students/students.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiChat.name, schema: AiChatSchema },
    ]),
    LmsModule,
    HomeworkModule,
    CoursesModule,
    StudentsModule,
    GroupsModule,
  ],
  controllers: [AiController],
  providers: [
    AiService,
    GroqService,
    LessonGeneratorService,
    ChatService,
  ],
  exports: [
    AiService,
    GroqService,
    LessonGeneratorService,
    ChatService,
  ],
})
export class AiModule {}
