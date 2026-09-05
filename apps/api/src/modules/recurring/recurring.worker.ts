import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { RecurringService } from './recurring.service';

@Processor('recurring-transactions')
export class RecurringWorker extends WorkerHost {
  constructor(private readonly recurringService: RecurringService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'process-due-recurring') {
      return await this.recurringService.processDueRecurringTransactions();
    }
  }
}