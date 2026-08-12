import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import { AcademyConfig, AcademyConfigSchema } from './schemas/academy-config.schema';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: AcademyConfig.name, schema: AcademyConfigSchema },
    ]),
    StudentsModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
