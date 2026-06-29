import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/enums/roles.enum';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  /** Student: do'stini taklif qiladi */
  @Post()
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  async create(
    @Body() body: { friendName: string; friendPhone: string },
    @Request() req: any,
  ) {
    // req.user.profileId yoki req.user.sub
    const referrerId = req.user.profileId || req.user.sub;
    return this.referralsService.create({
      referrerId,
      friendName: body.friendName,
      friendPhone: body.friendPhone,
    });
  }

  /** Admin: barcha referrallarni oladi */
  @Get()
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  async findAll() {
    return this.referralsService.findAll();
  }

  /** Admin: tasdiqlash - +2000 coin */
  @Post(':id/approve')
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  async approve(@Param('id') id: string) {
    return this.referralsService.approve(id);
  }

  /** Admin: rad etish */
  @Post(':id/reject')
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  async reject(@Param('id') id: string) {
    return this.referralsService.reject(id);
  }

  /** Admin: o'chirish */
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string) {
    return this.referralsService.delete(id);
  }

  /** Student: o'z referrallarini ko'rish */
  @Get('my')
  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  async myReferrals(@Request() req: any) {
    const referrerId = req.user.profileId || req.user.sub;
    return this.referralsService.findByStudent(referrerId);
  }
}
