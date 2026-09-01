import { Injectable, Logger } from '@nestjs/common';
import { Mailer } from './mailer.interface';

/**
 * Logs the email instead of sending it. No email provider is wired up yet
 * (no SMTP/SendGrid/Resend/etc.) — this lets the password-reset flow work
 * end-to-end today. Swap this out for a real Mailer implementation once a
 * provider is chosen; no other code should need to change.
 */
@Injectable()
export class ConsoleMailer implements Mailer {
  private readonly logger = new Logger(ConsoleMailer.name);

  sendPasswordResetEmail({
    to,
    resetUrl,
  }: {
    to: string;
    resetUrl: string;
  }): Promise<void> {
    this.logger.log(`Password reset link for ${to}: ${resetUrl}`);
    return Promise.resolve();
  }
}
