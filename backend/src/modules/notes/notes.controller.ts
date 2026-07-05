import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.RECEPTION)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new note to lead' })
  @ApiResponse({ status: 201, description: 'Note created.' })
  create(
    @Body('leadId') leadId: string,
    @Body('content') content: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.notesService.create(leadId, content, user.userId, ip);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get all notes for a specific lead' })
  @ApiResponse({ status: 200, description: 'Notes list.' })
  findByLead(@Param('leadId') leadId: string) {
    return this.notesService.findByLead(leadId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete note from lead' })
  @ApiResponse({ status: 200, description: 'Note deleted.' })
  remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.notesService.remove(id, user.userId, ip);
  }
}
