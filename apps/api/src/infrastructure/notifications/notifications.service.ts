import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobPayload } from './notifications.worker';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications-queue') private notificationsQueue: Queue<EmailJobPayload>,
  ) {}

  async sendBudgetWarning(email: string, categoryName: string, percentage: number, allocated: number, spent: number) {
    const subject = `⚠️ Budget Alert: ${categoryName} budget is ${percentage}% used`;
    const html = `
      <h2>FinanceHub Budget Alert</h2>
      <p>You have used <strong>${percentage}%</strong> of your <strong>${categoryName}</strong> budget for this month.</p>
      <ul>
        <li><strong>Allocated Budget:</strong> ₹${allocated.toLocaleString()}</li>
        <li><strong>Total Spent:</strong> ₹${spent.toLocaleString()}</li>
        <li><strong>Remaining:</strong> ₹${(allocated - spent).toLocaleString()}</li>
      </ul>
    `;

    await this.notificationsQueue.add('send-email', { to: email, subject, html });
  }
}