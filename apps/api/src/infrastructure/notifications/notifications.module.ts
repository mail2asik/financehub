import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsWorker } from './notifications.worker';
import { MailModule } from '../../infrastructure/mail/mail.module';

@Module({
  imports: [
    MailModule,
    BullModule.registerQueue({
      name: 'notifications-queue',
    }),
  ],
  providers: [NotificationsService, NotificationsWorker],
  exports: [NotificationsService],
})
export class NotificationsModule {}