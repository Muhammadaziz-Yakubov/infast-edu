import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, BatchAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Mark or update student attendance (Admin only)' })
  @ApiResponse({ status: 200, description: 'Attendance logged, student XP/Coins updated.' })
  mark(@Body() batchAttendanceDto: BatchAttendanceDto) {
    return this.attendanceService.markAttendanceBatch(batchAttendanceDto);
  }

  @Get('my-logs')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student attendance logs' })
  @ApiResponse({ status: 200, description: 'List of logs.' })
  findOwnLogs(@CurrentUser() user: any) {
    return this.attendanceService.getStudentAttendance(user.userId);
  }

  @Get('students/:studentId')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get a student attendance logs by student ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of logs.' })
  findStudentLogs(@Param('studentId') studentId: string) {
    return this.attendanceService.getStudentAttendance(studentId);
  }

  @Get('groups/:groupId/lessons/:lessonId')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get student attendance list for a specific group and lesson (Admin only)' })
  @ApiResponse({ status: 200, description: ' Roster list.' })
  findGroupAttendance(
    @Param('groupId') groupId: string,
    @Param('lessonId') lessonId: string
  ) {
    return this.attendanceService.getGroupAttendanceForLesson(groupId, lessonId);
  }
}
