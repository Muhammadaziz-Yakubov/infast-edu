import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypingBattleController } from './typing-battle.controller';
import { TypingBattleService } from './typing-battle.service';
import { TypingBattle, TypingBattleSchema } from './schemas/typing-battle.schema';
import { StudentProfile, StudentProfileSchema } from '../students/schemas/student-profile.schema';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TypingBattle.name, schema: TypingBattleSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
    ]),
    StudentsModule,
  ],
  controllers: [TypingBattleController],
  providers: [TypingBattleService],
  exports: [TypingBattleService],
})
export class TypingBattleModule {}
