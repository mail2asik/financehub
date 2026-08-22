import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/budget.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  createOrUpdate(@Request() req, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.createOrUpdate(req.user.id, dto);
  }

  @Get()
  getBudget(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month, 10) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : currentDate.getFullYear();

    return this.budgetsService.getBudgetDetails(req.user.id, targetMonth, targetYear);
  }
}