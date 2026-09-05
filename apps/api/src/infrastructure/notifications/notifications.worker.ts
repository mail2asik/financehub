import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../../infrastructure/mail/mail.service';

export interface EmailJobPayload {
  to: string;
  subject: string;
  html: string;
}

@Processor('notifications-queue')
export class NotificationsWorker extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<EmailJobPayload>): Promise<any> {
    if (job.name === 'send-email') {
      const { to, subject, html } = job.data;
      return await this.mailService.sendMail(to, subject, html);
    }
  }
}