import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Add a new video or book to the library (Admin only)' })
  create(@Body() dto: any) {
    return this.libraryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all library items (videos & books)' })
  findAll(@Query('type') type?: string) {
    return this.libraryService.findAll(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get library item by ID' })
  findOne(@Param('id') id: string) {
    return this.libraryService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update library item details (Admin only)' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.libraryService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete library item (Admin only)' })
  remove(@Param('id') id: string) {
    return this.libraryService.remove(id);
  }
}
