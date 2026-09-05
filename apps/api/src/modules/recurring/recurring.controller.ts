import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RecurringService } from './recurring.service';
import { CreateRecurringDto } from './dto/recurring.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('recurring-transactions')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateRecurringDto) {
    return this.recurringService.create(req.user.id, dto);
  }
}