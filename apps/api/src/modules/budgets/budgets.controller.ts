import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request as NestRequest,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/budget.dto';
import { AuthGuard } from '@nestjs/passport';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  createOrUpdate(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: CreateBudgetDto,
  ) {
    return this.budgetsService.createOrUpdate(req.user.id, dto);
  }

  @Get()
  getBudget(
    @NestRequest() req: AuthenticatedRequest,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const currentDate = new Date();
    const targetMonth = month
      ? parseInt(month, 10)
      : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : currentDate.getFullYear();

    return this.budgetsService.getBudgetDetails(
      req.user.id,
      targetMonth,
      targetYear,
    );
  }
}