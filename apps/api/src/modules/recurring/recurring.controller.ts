import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Delete,
  Param,
  Get,
} from '@nestjs/common';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';
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
  @ApiMessage('Recurring transaction created successfully')
  create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateRecurringDto,
  ) {
    return this.recurringService.create(req.user.id, dto);
  }

  @Get()
  @ApiMessage('Recurring transactions retrieved successfully')
  findAll(@Request() req: AuthenticatedRequest) {
    return this.recurringService.findAll(req.user.id);
  }

  @Delete(':id')
  @ApiMessage('Recurring transaction deleted successfully')
  delete(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.recurringService.delete(req.user.id, id);
  }
}
