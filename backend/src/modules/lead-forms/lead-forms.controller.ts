import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { LeadFormsService } from './lead-forms.service';
import { CreateLeadFormDto } from './dto/create-lead-form.dto';
import { SubmitLeadFormDto } from './dto/submit-lead-form.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('lead-forms')
@Controller('lead-forms')
export class LeadFormsController {
  constructor(private readonly leadFormsService: LeadFormsService) {}

  // Protected Admin/Manager endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new marketing lead form (Admin/Manager)' })
  @ApiResponse({ status: 201, description: 'Form created successfully.' })
  create(@Body() dto: CreateLeadFormDto) {
    return this.leadFormsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all marketing lead forms (Admin/Manager)' })
  @ApiResponse({ status: 200, description: 'List of lead forms.' })
  findAll() {
    return this.leadFormsService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lead form (Admin/Manager)' })
  @ApiResponse({ status: 200, description: 'Form deleted.' })
  remove(@Param('id') id: string) {
    return this.leadFormsService.remove(id);
  }

  // Public Endpoints (No Auth Required)
  @Get('public/:id')
  @ApiOperation({ summary: 'Get public lead form details by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Public form details.' })
  findOnePublic(@Param('id') id: string) {
    return this.leadFormsService.findOnePublic(id);
  }

  @Post('public/:id/submit')
  @ApiOperation({ summary: 'Submit lead details via public lead form (Public)' })
  @ApiResponse({ status: 201, description: 'Lead submitted.' })
  submitPublic(@Param('id') id: string, @Body() dto: SubmitLeadFormDto) {
    return this.leadFormsService.submitPublic(id, dto);
  }
}
