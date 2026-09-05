import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { BudgetsService } from '../budgets/budgets.service';
import { NotificationsModule } from '../../infrastructure/notifications/notifications.module';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService, BudgetsService],
  imports: [NotificationsModule],
  exports: [TransactionsService],
})
export class TransactionsModule {}