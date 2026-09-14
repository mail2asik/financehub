import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import * as nodemailer from 'nodemailer';
import { ApiException } from 'src/common/exceptions/api.exception';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'localhost',
      port: Number(process.env.MAIL_PORT) || 1025,
      secure: false,
    });
  }

  async subscribe(dto: SubscribeNewsletterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check for existing subscription
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const existing = await this.prisma.newsletterSubscription.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ApiException(
        'This email is already subscribed to our newsletter.',
        'EMAIL_ALREADY_SUBSCRIBED',
        HttpStatus.CONFLICT,
      );
    }

    try {
      // Persist new subscription
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const subscription = await this.prisma.newsletterSubscription.create({
        data: { email: normalizedEmail },
      });

      // Notify Admin asynchronously
      await this.sendAdminNotification(normalizedEmail);

      return {
        success: true,
        message: 'Successfully subscribed to the newsletter!',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: subscription,
      };
    } catch (error) {
      this.logger.error('Failed to process newsletter subscription', error);
      throw new ApiException(
        'Could not complete subscription.',
        'SUBSCRIPTION_FAILED',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async sendAdminNotification(subscriberEmail: string): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL is not defined in environment properties.');
      return;
    }

    const mailOptions = {
      from: `"FinanceHub Newsletter" <${subscriberEmail}>`,
      to: adminEmail,
      subject: `[Newsletter] New Subscriber Joined`,
      html: `
        <h2>New Newsletter Subscriber</h2>
        <p>A new user has subscribed to the FinanceHub newsletter:</p>
        <p><strong>Email:</strong> ${subscriberEmail}</p>
        <p><strong>Subscribed At:</strong> ${new Date().toLocaleString()}</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (err) {
      this.logger.error('Failed to send admin notification email', err);
    }
  }
}