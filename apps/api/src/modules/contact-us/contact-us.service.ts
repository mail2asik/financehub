import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ContactUsDto } from './dto/contact-us.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactUsService {
  private readonly logger = new Logger(ContactUsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly prisma: PrismaService) {
    // Configure Nodemailer transporter using environment properties
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'localhost',
      port: Number(process.env.MAIL_PORT) || 1025,
      secure: false, // set to true if using SSL/465
    });
  }

  async createSubmission(dto: ContactUsDto) {
    try {
      // 1. Persist submission in Database
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const submission = await this.prisma.contactSubmission.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          subject: dto.subject,
          message: dto.message,
        },
      });

      // 2. Send email notification to Admin
      await this.sendAdminNotification(dto);

      return {
        success: true,
        message: 'Your message has been submitted successfully.',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: submission,
      };
    } catch (error) {
      this.logger.error('Failed to process contact submission', error);
      throw new InternalServerErrorException('Could not complete submission.');
    }
  }

  private async sendAdminNotification(dto: ContactUsDto): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL is not defined in environment properties.');
      return;
    }

    const mailOptions = {
      from: `"FinanceHub Contact Form" <${dto.email}>`,
      to: adminEmail,
      subject: `[Contact Us] ${dto.subject}`,
      html: `
        <h2>New Contact Submission Received</h2>
        <p><strong>Name:</strong> ${dto.fullName}</p>
        <p><strong>Sender Email:</strong> ${dto.email}</p>
        <p><strong>Subject:</strong> ${dto.subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${dto.message}</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
