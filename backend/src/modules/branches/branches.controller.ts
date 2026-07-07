import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new branch and its branch admin (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Branch and admin successfully created.' })
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get branches with search and pagination (Super Admin sees all, Branch Admin sees own)' })
  @ApiResponse({ status: 200, description: 'List of branches.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @CurrentUser() user?: any,
  ) {
    return this.branchesService.findAll({ page, limit, search, status }, user);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get branch details by ID' })
  @ApiResponse({ status: 200, description: 'Branch details.' })
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.branchesService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update branch details (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Branch successfully updated.' })
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto, @CurrentUser() user?: any) {
    return this.branchesService.update(id, updateBranchDto, user);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete branch and its admin (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Branch successfully deleted.' })
  remove(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.branchesService.remove(id, user);
  }
}
