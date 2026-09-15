import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        secure: process.env.MAIL_SECURE === 'true',
        requireTLS: true,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'financehub-mailpit',
        port: parseInt(process.env.MAIL_PORT || '1025', 10),
        secure: false,
      });
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"FinanceHub" <${process.env.MAIL_FROM}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully to ${to}: ${info.messageId}`);

      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
