import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TelegramBotService } from './telegram-bot.service';
import * as express from 'express';

@ApiTags('Telegram Bot Reports')
@Controller('telegram-bot')
export class TelegramBotController {
  constructor(private readonly botService: TelegramBotService) {}

  @Get('export/excel')
  @ApiOperation({ summary: 'Export CRM payments report to Excel for the Director' })
  @ApiQuery({ name: 'period', enum: ['daily', 'weekly', 'monthly', 'yearly'], default: 'monthly' })
  async exportExcel(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    @Res() res: express.Response
  ) {
    try {
      const buffer = await this.botService.generateReportExcelBuffer(period);
      const dateStr = new Date().toISOString().split('T')[0];

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Hisobot_${period}_${dateStr}.xlsx`,
      );
      res.send(buffer);
    } catch (e) {
      res.status(500).json({
        statusCode: 500,
        message: `Excel export failure: ${e.message}`,
      });
    }
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export CRM payments report to PDF for the Director' })
  @ApiQuery({ name: 'period', enum: ['daily', 'weekly', 'monthly', 'yearly'], default: 'monthly' })
  async exportPdf(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    @Res() res: express.Response
  ) {
    try {
      const buffer = await this.botService.generateReportPdfBuffer(period);
      const dateStr = new Date().toISOString().split('T')[0];

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Hisobot_${period}_${dateStr}.pdf`,
      );
      res.send(buffer);
    } catch (e) {
      res.status(500).json({
        statusCode: 500,
        message: `PDF export failure: ${e.message}`,
      });
    }
  }
}
