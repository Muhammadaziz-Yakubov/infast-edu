import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LmsService } from './lms.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('lms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lms')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  // Modules
  @Post('modules')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new course module (Admin only)' })
  createModule(@Body() createModuleDto: CreateModuleDto) {
    return this.lmsService.createModule(createModuleDto);
  }

  @Get('courses/:courseId/modules')
  @ApiOperation({ summary: 'Get all modules in a course' })
  findModules(@Param('courseId') courseId: string) {
    return this.lmsService.findModulesByCourse(courseId);
  }

  @Patch('modules/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update module details (Admin only)' })
  updateModule(@Param('id') id: string, @Body() updateModuleDto: any) {
    return this.lmsService.updateModule(id, updateModuleDto);
  }

  @Delete('modules/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete module and its lessons (Admin only)' })
  removeModule(@Param('id') id: string) {
    return this.lmsService.removeModule(id);
  }

  // Lessons
  @Post('lessons')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new lesson in a module (Admin only)' })
  createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.lmsService.createLesson(createLessonDto);
  }

  @Get('modules/:moduleId/lessons')
  @ApiOperation({ summary: 'Get all lessons in a module' })
  findLessons(@Param('moduleId') moduleId: string) {
    return this.lmsService.findLessonsByModule(moduleId);
  }

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Get lesson details by ID' })
  findOneLesson(@Param('id') id: string) {
    return this.lmsService.findOneLesson(id);
  }

  @Patch('lessons/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update lesson details (Admin only)' })
  updateLesson(@Param('id') id: string, @Body() updateLessonDto: any) {
    return this.lmsService.updateLesson(id, updateLessonDto);
  }

  @Delete('lessons/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete lesson and its progress logs (Admin only)' })
  removeLesson(@Param('id') id: string) {
    return this.lmsService.removeLesson(id);
  }

  // Student Progress & Completion
  @Post('lessons/:id/complete')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Submit quiz answers and complete lesson (Student only)' })
  @ApiResponse({ status: 200, description: 'Lesson completed, awards XP.' })
  completeLesson(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('quizAnswers') quizAnswers?: number[],
    @Body('completedRounds') completedRounds?: number
  ) {
    return this.lmsService.completeLesson(user.userId, id, quizAnswers, completedRounds);
  }

  @Get('lessons/:id/progress')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get student progress on a specific lesson' })
  getLessonProgress(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lmsService.getLessonProgress(user.userId, id);
  }

  @Get('courses/:courseId/progress')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get overall student progress on a course' })
  getCourseProgress(@Param('courseId') courseId: string, @CurrentUser() user: any) {
    return this.lmsService.getCourseProgress(user.userId, courseId);
  }

  @Get('groups/:groupId/grades')
  @Roles(Role.STUDENT, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get gradebook table data for classmate student profiles inside a group' })
  getGroupGrades(@Param('groupId') groupId: string) {
    return this.lmsService.getGroupGrades(groupId);
  }

  // ── Stories Controller ──

  @Get('stories')
  @ApiOperation({ summary: 'Get active stories' })
  getStories(@CurrentUser() user: any) {
    return this.lmsService.findStories(user.userId);
  }

  @Post('stories')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new story (Admin only)' })
  createStory(@Body() dto: any) {
    return this.lmsService.createStory(dto);
  }

  @Post('stories/:id/like')
  @ApiOperation({ summary: 'Toggle like state on a story' })
  toggleLikeStory(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lmsService.toggleLikeStory(id, user.userId);
  }

  @Post('stories/:id/view')
  @ApiOperation({ summary: 'Log a story view' })
  viewStory(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lmsService.viewStory(id, user.userId);
  }

  @Delete('stories/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a story (Admin only)' })
  deleteStory(@Param('id') id: string) {
    return this.lmsService.deleteStory(id);
  }
}
