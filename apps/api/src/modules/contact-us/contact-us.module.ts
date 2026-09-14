import { Module } from '@nestjs/common';
import { ContactUsController } from './contact-us.controller';
import { ContactUsService } from './contact-us.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [],
  providers: [PrismaService, ContactUsService],
  controllers: [ContactUsController],
  exports: [ContactUsService],
})
export class ContactUsModule {}
