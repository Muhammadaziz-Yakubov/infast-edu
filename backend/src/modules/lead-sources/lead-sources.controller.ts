import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { LeadSourcesService } from './lead-sources.service';
import { CreateLeadSourceDto } from './dto/create-lead-source.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('lead-sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER)
@Controller('lead-sources')
export class LeadSourcesController {
  constructor(private readonly leadSourcesService: LeadSourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new lead source (Admin/Manager)' })
  @ApiResponse({ status: 201, description: 'Source created.' })
  create(@Body() dto: CreateLeadSourceDto) {
    return this.leadSourcesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lead sources' })
  @ApiResponse({ status: 200, description: 'List of all lead sources.' })
  findAll() {
    return this.leadSourcesService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lead source (Admin/Manager)' })
  @ApiResponse({ status: 200, description: 'Source deleted.' })
  remove(@Param('id') id: string) {
    return this.leadSourcesService.remove(id);
  }
}
