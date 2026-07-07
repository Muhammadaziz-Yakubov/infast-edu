import { Module } from '@nestjs/common';
import { TelegramAiController } from './telegram-ai.controller';
import { TelegramAiService } from './telegram-ai.service';

@Module({
  controllers: [TelegramAiController],
  providers: [TelegramAiService],
  exports: [TelegramAiService],
})
export class TelegramAiModule {}
