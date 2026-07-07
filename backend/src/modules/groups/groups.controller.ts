import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Create a new group and automatically calculate lesson schedule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Group created and lessons scheduled.' })
  create(@Body() createGroupDto: CreateGroupDto, @CurrentUser() user: any) {
    return this.groupsService.createGroup(createGroupDto, user);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get all groups' })
  @ApiResponse({ status: 200, description: 'List of groups.' })
  findAll(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    return this.groupsService.findAll(user, branchId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get group details by ID' })
  @ApiResponse({ status: 200, description: 'Group details.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Update group details (Admin only)' })
  update(@Param('id') id: string, @Body() updateGroupDto: any, @CurrentUser() user: any) {
    return this.groupsService.updateGroup(id, updateGroupDto, user);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Delete group (Admin only)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.removeGroup(id, user);
  }

  @Post(':id/students')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Add a student to a group (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student added to group.' })
  addStudent(@Param('id') id: string, @Body('studentId') studentId: string, @CurrentUser() user: any) {
    return this.groupsService.addStudentToGroup(id, studentId, user);
  }

  @Delete(':id/students/:studentId')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Remove a student from a group (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student removed from group.' })
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string, @CurrentUser() user: any) {
    return this.groupsService.removeStudentFromGroup(id, studentId, user);
  }

  @Get(':id/schedule')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get the automatically generated lesson schedule dates for a group' })
  @ApiResponse({ status: 200, description: 'List of scheduled lessons.' })
  getSchedule(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.getGroupSchedule(id, user);
  }

  @Get(':id/progress')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get overall progress of all students in a group (Admin only)' })
  @ApiResponse({ status: 200, description: 'Detailed student progress list.' })
  getProgress(@Param('id') id: string, @CurrentUser() user: any) {
    return this.groupsService.getGroupProgress(id, user);
  }
}
