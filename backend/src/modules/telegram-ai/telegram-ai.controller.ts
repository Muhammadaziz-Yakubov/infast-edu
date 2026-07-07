import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TelegramAiService } from './telegram-ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('telegram-ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.RECEPTION)
@Controller('telegram-ai')
export class TelegramAiController {
  constructor(private readonly telegramAiService: TelegramAiService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get Telegram AI Agent status' })
  getStatus() {
    return this.telegramAiService.getStatus();
  }

  @Post('start')
  @ApiOperation({ summary: 'Start Telegram AI Agent process' })
  startAgent() {
    return this.telegramAiService.startAgent();
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop Telegram AI Agent process' })
  stopAgent() {
    return this.telegramAiService.stopAgent();
  }

  @Post('submit-code')
  @ApiOperation({ summary: 'Submit OTP / Login Code to Telegram' })
  submitCode(@Body('code') code: string) {
    return this.telegramAiService.submitCode(code);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear Telegram session' })
  logout() {
    return this.telegramAiService.logout();
  }
}
