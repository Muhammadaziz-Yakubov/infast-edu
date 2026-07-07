import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group, GroupSchema } from './schemas/group.schema';
import { GroupLessonSchedule, GroupLessonScheduleSchema } from './schemas/group-lesson-schedule.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { LmsModule } from '../lms/lms.module';
import { StudentsModule } from '../students/students.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: GroupLessonSchedule.name, schema: GroupLessonScheduleSchema },
      { name: User.name, schema: UserSchema },
    ]),
    LmsModule,
    forwardRef(() => StudentsModule),
    forwardRef(() => ChatModule),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService, MongooseModule],
})
export class GroupsModule {}

