import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('homework')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create homework for a lesson (Admin only)' })
  @ApiResponse({ status: 201, description: 'Homework created.' })
  create(@Body() createHomeworkDto: CreateHomeworkDto) {
    return this.homeworkService.createHomework(createHomeworkDto);
  }

  @Get('lessons/:lessonId')
  @ApiOperation({ summary: 'Get homework details for a specific lesson' })
  @ApiResponse({ status: 200, description: 'Homework details.' })
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.homeworkService.findHomeworkByLesson(lessonId);
  }

  @Get('submissions')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all submissions across all homeworks (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all submissions.' })
  getAllSubmissions() {
    return this.homeworkService.findAllSubmissions();
  }

  @Post('submissions/:submissionId/grade')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Manually grade/override score of a homework submission (Admin only)' })
  @ApiResponse({ status: 200, description: 'Submission graded successfully.' })
  grade(
    @Param('submissionId') submissionId: string,
    @Body('score') score: number
  ) {
    return this.homeworkService.gradeSubmission(submissionId, score);
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Submit answers for a homework (Student only)' })
  @ApiResponse({ status: 200, description: 'Homework graded and rewards calculated.' })
  submit(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() submitHomeworkDto: SubmitHomeworkDto
  ) {
    return this.homeworkService.submitHomework(user.userId, id, submitHomeworkDto);
  }

  @Get(':id/submissions')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all student submissions for a homework (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of submissions.' })
  getSubmissions(@Param('id') id: string) {
    return this.homeworkService.getSubmissionsForHomework(id);
  }

  @Get(':id/my-submission')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get the logged-in student submission for a homework' })
  @ApiResponse({ status: 200, description: 'Student submission details.' })
  getMySubmission(@Param('id') id: string, @CurrentUser() user: any) {
    return this.homeworkService.getSubmission(user.userId, id);
  }

}
