import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.RECEPTION)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Attach a file to lead record' })
  @ApiResponse({ status: 201, description: 'File attached.' })
  create(@Body() dto: CreateAttachmentDto, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.attachmentsService.create(dto, user.userId, ip);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get all attachments for a specific lead' })
  @ApiResponse({ status: 200, description: 'Attachments list.' })
  findByLead(@Param('leadId') leadId: string) {
    return this.attachmentsService.findByLead(leadId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lead attachment record' })
  @ApiResponse({ status: 200, description: 'Attachment deleted.' })
  remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.attachmentsService.remove(id, user.userId, ip);
  }
}
