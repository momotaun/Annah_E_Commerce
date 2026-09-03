import { Injectable, Logger } from '@nestjs/common';
import { InvoiceEmailItem, Mailer } from './mailer.interface';

/**
 * Logs the email instead of sending it — the default when RESEND_API_KEY
 * isn't set (see mailer.module.ts). Lets every mail-triggering flow work
 * end-to-end locally with no email provider configured at all.
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

  sendVerificationEmail({
    to,
    verifyUrl,
  }: {
    to: string;
    firstName: string;
    verifyUrl: string;
  }): Promise<void> {
    this.logger.log(`Verification link for ${to}: ${verifyUrl}`);
    return Promise.resolve();
  }

  sendInvoiceEmail({
    to,
    orderId,
    invoiceNumber,
    totalAmount,
  }: {
    to: string;
    firstName: string;
    orderId: string;
    invoiceNumber: string;
    items: InvoiceEmailItem[];
    totalAmount: string;
  }): Promise<void> {
    this.logger.log(
      `Invoice ${invoiceNumber} for order ${orderId} (R${totalAmount}) sent to ${to}`,
    );
    return Promise.resolve();
  }

  sendOrderStatusEmail({
    to,
    orderId,
    status,
  }: {
    to: string;
    firstName: string;
    orderId: string;
    status: 'SHIPPED' | 'DELIVERED';
  }): Promise<void> {
    this.logger.log(`Order ${orderId} marked ${status} — notifying ${to}`);
    return Promise.resolve();
  }
}
