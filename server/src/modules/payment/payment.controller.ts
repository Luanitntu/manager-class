import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PaymentService } from './payment.service';
import {
  CreateTuitionDto,
  ListTuitionQueryDto,
  RecordPaymentDto,
  UpdateTuitionDto,
} from './dto/payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  // Tuition list — teacher (tenant) or student (own).
  @Get('tuitions')
  list(@CurrentUser() actor: AuthenticatedUser, @Query() query: ListTuitionQueryDto) {
    return this.payments.list(actor, query);
  }

  @Get('tuitions/:id')
  getOne(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.payments.getOne(actor, id);
  }

  @Roles(Role.TEACHER)
  @Post('tuitions')
  create(@CurrentUser() actor: AuthenticatedUser, @Body() dto: CreateTuitionDto) {
    return this.payments.createTuition(actor, dto);
  }

  @Roles(Role.TEACHER)
  @Patch('tuitions/:id')
  update(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTuitionDto,
  ) {
    return this.payments.updateTuition(actor, id, dto);
  }

  @Roles(Role.TEACHER)
  @Post('tuitions/:id/payments')
  recordPayment(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.payments.recordPayment(actor, id, dto);
  }

  @Roles(Role.TEACHER)
  @Delete('tuitions/:id/payments/:paymentId')
  deletePayment(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    return this.payments.deletePayment(actor, id, paymentId);
  }

  @Roles(Role.TEACHER)
  @Delete('tuitions/:id')
  deleteTuition(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.payments.deleteTuition(actor, id);
  }

  @Roles(Role.TEACHER)
  @Post('tuitions/:id/remind')
  remind(@CurrentUser() actor: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.payments.sendReminder(actor, id);
  }

  @Get('receipts/:receiptNumber')
  getReceipt(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('receiptNumber') receiptNumber: string,
  ) {
    return this.payments.getReceipt(actor, receiptNumber);
  }
}
