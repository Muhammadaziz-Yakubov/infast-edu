import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Register a monthly payment for a student (Admin only)' })
  @ApiResponse({ status: 201, description: 'Payment registered. Student profile updated.' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all payments.' })
  findAll() {
    return this.paymentsService.getAllPayments();
  }

  @Get('my-history')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student payment history' })
  @ApiResponse({ status: 200, description: 'Student payment history.' })
  findOwnHistory(@CurrentUser() user: any) {
    return this.paymentsService.getStudentPayments(user.userId);
  }

  @Get('my-summary')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student payment summary: status + next date + history' })
  @ApiResponse({ status: 200, description: 'Payment summary with status and history.' })
  getOwnSummary(@CurrentUser() user: any) {
    return this.paymentsService.getStudentPaymentSummary(user.userId);
  }

  @Get('students/:studentId')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get a student payment history by student ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student payment history.' })
  findStudentHistory(@Param('studentId') studentId: string) {
    return this.paymentsService.getStudentPaymentsFormatted(studentId);
  }

  @Get('students/:studentId/summary')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get a student payment summary by student ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student payment summary with status and next date.' })
  findStudentSummary(@Param('studentId') studentId: string) {
    return this.paymentsService.getStudentPaymentSummary(studentId);
  }

  @Get('overdue')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all overdue student payments (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of overdue payments.' })
  findOverdue() {
    return this.paymentsService.getOverdueStudents();
  }

  @Post('check-statuses')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Manually trigger payment status check for all students (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment statuses updated.' })
  async checkStatuses() {
    await this.paymentsService.checkPaymentStatuses();
    return { success: true, message: 'Barcha tolov statuslari yangilandi.' };
  }
}
