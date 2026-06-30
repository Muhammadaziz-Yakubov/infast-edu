import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get student leaderboard (Available to all authenticated users)' })
  @ApiResponse({ status: 200, description: 'Leaderboard list.' })
  getLeaderboard() {
    return this.studentsService.getLeaderboard();
  }

  @Get('me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current logged-in student profile' })
  @ApiResponse({ status: 200, description: 'Student profile.' })
  getOwnProfile(@CurrentUser() user: any) {
    return this.studentsService.getProfile(user.userId);
  }

  @Patch('me/avatar')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Update student avatar (Student only)' })
  @ApiResponse({ status: 200, description: 'Avatar updated successfully.' })
  updateOwnAvatar(@CurrentUser() user: any, @Body() body: { avatar: string }) {
    return this.studentsService.updateOwnAvatar(user.userId, body.avatar);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all students profiles (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all student profiles.' })
  findAll() {
    return this.studentsService.findAll();
  }


  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a student (Admin only)' })
  @ApiResponse({ status: 201, description: 'Student created successfully.' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.createStudent(createStudentDto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a student profile/user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student updated successfully.' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.updateStudent(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a student profile and user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.studentsService.deleteStudent(id);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get a student profile by user ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student profile details.' })
  findOne(@Param('id') id: string) {
    return this.studentsService.getProfile(id);
  }
}
