import { IsEnum, IsNotEmpty } from 'class-validator';
import { ExtraLessonAttendanceStatus } from '../schemas/extra-lesson-slot.schema';

export class UpdateAttendanceDto {
  @IsEnum(ExtraLessonAttendanceStatus)
  @IsNotEmpty()
  attendanceStatus: ExtraLessonAttendanceStatus;
}
