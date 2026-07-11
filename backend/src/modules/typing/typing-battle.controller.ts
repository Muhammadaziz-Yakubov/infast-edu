import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TypingBattleService } from './typing-battle.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('typing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('typing')
export class TypingBattleController {
  constructor(private readonly typingBattleService: TypingBattleService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new typing battle match' })
  async startBattle(@CurrentUser() user: any) {
    return this.typingBattleService.startBattle(user.userId);
  }

  @Post('result')
  @ApiOperation({ summary: 'Submit typing battle results' })
  async saveResult(@CurrentUser() user: any, @Body() body: any) {
    return this.typingBattleService.saveResult(user.userId, body);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get typing battle leaderboard' })
  async getLeaderboard() {
    return this.typingBattleService.getLeaderboard();
  }
}
