import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RecurringService } from './recurring.service';
import { CreateRecurringDto } from './dto/recurring.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('recurring-transactions')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateRecurringDto,
  ) {
    return this.recurringService.create(req.user.id, dto);
  }
}