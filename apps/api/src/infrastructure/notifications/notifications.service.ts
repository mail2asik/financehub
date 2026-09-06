import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobPayload } from './notifications.worker';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications-queue')
    private notificationsQueue: Queue<EmailJobPayload>,
  ) {}

  /**
   * Enqueues an account activation email containing a 6-digit OTP code.
   */
  async sendActivationEmail(email: string, code: string): Promise<void> {
    const subject = '🔑 Activate Your FinanceHub Account';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb;">Welcome to FinanceHub!</h2>
        <p>Thank you for registering. Please use the activation code below to verify and activate your account:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1f2937; margin: 20px 0; border-radius: 6px;">
          ${code}
        </div>
        <p>This code will expire in <strong>15 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 14px;">If you did not request this registration, please ignore this email.</p>
      </div>
    `;

    await this.notificationsQueue.add('send-email', {
      to: email,
      subject,
      html,
    });
  }

  /**
   * Enqueues a password reset email containing a 6-digit reset code.
   */
  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const subject = '🔒 Password Reset Request - FinanceHub';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>We received a request to reset your password for your FinanceHub account. Use the code below to set a new password:</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #991b1b; margin: 20px 0; border-radius: 6px;">
          ${code}
        </div>
        <p>This code will expire in <strong>15 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 14px;">If you did not request a password reset, your account is safe and you can safely ignore this message.</p>
      </div>
    `;

    await this.notificationsQueue.add('send-email', {
      to: email,
      subject,
      html,
    });
  }

  async sendBudgetWarning(
    email: string,
    categoryName: string,
    percentage: number,
    allocated: number,
    spent: number,
  ) {
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

    await this.notificationsQueue.add('send-email', {
      to: email,
      subject,
      html,
    });
  }
}
