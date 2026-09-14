import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [],
  providers: [NewsletterService, PrismaService],
  controllers: [NewsletterController],
  exports: [NewsletterService],
})
export class NewsletterModule {}