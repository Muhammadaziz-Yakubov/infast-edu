import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ConversionsService } from './conversions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('conversions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER)
@Controller('conversions')
export class ConversionsController {
  constructor(private readonly conversionsService: ConversionsService) {}

  @Post(':leadId/convert')
  @ApiOperation({ summary: 'Convert lead to Student (ACID Transaction wrapped)' })
  @ApiResponse({ status: 200, description: 'Lead successfully converted to Student user.' })
  convert(
    @Param('leadId') leadId: string,
    @Body('courseId') courseId: string,
    @Body('groupId') groupId: string,
    @Body('amount') amount: number,
    @Body('nextPaymentDate') nextPaymentDate: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket?.remoteAddress;
    return this.conversionsService.convertLeadToStudent(
      leadId,
      courseId,
      groupId,
      amount,
      nextPaymentDate,
      user.userId,
      ip,
    );
  }
}
