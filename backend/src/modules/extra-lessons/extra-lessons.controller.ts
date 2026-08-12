import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExtraLessonsService } from './extra-lessons.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { BookSlotDto } from './dto/book-slot.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('extra-lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('extra-lessons')
export class ExtraLessonsController {
  constructor(private readonly extraLessonsService: ExtraLessonsService) {}

  @Post('slots')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Create a available extra lesson slot (Admin)' })
  createSlot(@CurrentUser() user: any, @Body() dto: CreateSlotDto) {
    return this.extraLessonsService.createSlot(dto, user.userId);
  }

  @Get('admin')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get all slots for admin panel' })
  getAllSlotsForAdmin(@Query('date') date?: string) {
    return this.extraLessonsService.getAllSlotsForAdmin(date);
  }

  @Delete('slots/:id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Delete a slot' })
  deleteSlot(@Param('id') id: string) {
    return this.extraLessonsService.deleteSlot(id);
  }

  @Patch('slots/:id/attendance')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Mark student attendance for extra lesson (Attended/Absent)' })
  updateAttendance(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.extraLessonsService.updateAttendance(id, dto);
  }

  @Get('available')
  @Roles(Role.STUDENT, Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get available slots for booking' })
  getAvailableSlots() {
    return this.extraLessonsService.getAvailableSlots();
  }

  @Post('book')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Book an extra lesson slot (Student)' })
  bookSlot(@CurrentUser() user: any, @Body() dto: BookSlotDto) {
    return this.extraLessonsService.bookSlot(user.userId, dto);
  }

  @Get('my-bookings')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student extra lesson bookings' })
  getStudentBookings(@CurrentUser() user: any) {
    return this.extraLessonsService.getStudentBookings(user.userId);
  }
}
