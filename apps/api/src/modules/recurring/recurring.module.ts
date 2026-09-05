import { Module } from '@nestjs/common';
import { RecurringService } from './recurring.service';
import { RecurringController } from './recurring.controller';
import { RecurringWorker } from './recurring.worker';
import { TransactionsModule } from '../transactions/transactions.module';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [TransactionsModule, QueueModule],
  controllers: [RecurringController],
  providers: [RecurringService, RecurringWorker, PrismaService],
})
export class RecurringModule {}