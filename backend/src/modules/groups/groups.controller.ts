import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new group and automatically calculate lesson schedule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Group created and lessons scheduled.' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.createGroup(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  @ApiResponse({ status: 200, description: 'List of groups.' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group details by ID' })
  @ApiResponse({ status: 200, description: 'Group details.' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update group details (Admin only)' })
  update(@Param('id') id: string, @Body() updateGroupDto: any) {
    return this.groupsService.updateGroup(id, updateGroupDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete group (Admin only)' })
  remove(@Param('id') id: string) {
    return this.groupsService.removeGroup(id);
  }

  @Post(':id/students')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add a student to a group (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student added to group.' })
  addStudent(@Param('id') id: string, @Body('studentId') studentId: string) {
    return this.groupsService.addStudentToGroup(id, studentId);
  }

  @Delete(':id/students/:studentId')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove a student from a group (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student removed from group.' })
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.groupsService.removeStudentFromGroup(id, studentId);
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get the automatically generated lesson schedule dates for a group' })
  @ApiResponse({ status: 200, description: 'List of scheduled lessons.' })
  getSchedule(@Param('id') id: string) {
    return this.groupsService.getGroupSchedule(id);
  }
}
