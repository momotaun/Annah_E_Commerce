import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import { InvoiceEmailItem, Mailer } from './mailer.interface';

// Kept deliberately plain — no template engine, no shared layout file.
// Four short emails don't earn that abstraction; if a fifth or a real
// design pass shows up, wrap() is the seam to replace.
function wrap(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; background: #f9fafb; margin: 0; padding: 32px 16px;">
    <table role="presentation" width="100%" style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
      <tr>
        <td style="background: #1d4ed8; padding: 20px 24px;">
          <span style="color: #ffffff; font-size: 18px; font-weight: 700;">Apex Marketplace</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px;">
          <h1 style="font-size: 20px; margin: 0 0 12px;">${title}</h1>
          ${bodyHtml}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(url: string, label: string): string {
  return `<a href="${url}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #1d4ed8; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">${label}</a>`;
}

@Injectable()
export class ResendMailer implements Mailer {
  // Lazy, not built in the constructor: MailerModule always instantiates
  // this class (it's a candidate the MAILER factory picks between — see
  // mailer.module.ts), even on a machine with no RESEND_API_KEY set at
  // all. Throwing here instead of in the constructor keeps that default,
  // Resend-not-configured case bootable.
  private getClient(): Resend {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'Resend is not configured: missing RESEND_API_KEY',
      );
    }
    return new Resend(apiKey);
  }

  private get from(): string {
    return (
      process.env.RESEND_FROM_EMAIL ??
      'Apex Marketplace <onboarding@resend.dev>'
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const { error } = await this.getClient().emails.send({
      from: this.from,
      to,
      subject,
      html,
    });
    if (error) {
      throw new InternalServerErrorException(
        `Resend failed to send "${subject}" to ${to}: ${error.message}`,
      );
    }
  }

  sendPasswordResetEmail({
    to,
    resetUrl,
  }: {
    to: string;
    resetUrl: string;
  }): Promise<void> {
    return this.send(
      to,
      'Reset your password',
      wrap(
        'Reset your password',
        `<p style="color: #4b5563; font-size: 14px;">We received a request to reset your password. This link expires in 1 hour — if you didn't request this, you can ignore this email.</p>
         ${button(resetUrl, 'Reset Password')}`,
      ),
    );
  }

  sendVerificationEmail({
    to,
    firstName,
    verifyUrl,
  }: {
    to: string;
    firstName: string;
    verifyUrl: string;
  }): Promise<void> {
    return this.send(
      to,
      'Verify your email address',
      wrap(
        `Welcome, ${firstName}`,
        `<p style="color: #4b5563; font-size: 14px;">Confirm your email address to finish setting up your Apex Marketplace account. This link expires in 24 hours.</p>
         ${button(verifyUrl, 'Verify Email')}`,
      ),
    );
  }

  sendInvoiceEmail({
    to,
    firstName,
    orderId,
    invoiceNumber,
    items,
    totalAmount,
  }: {
    to: string;
    firstName: string;
    orderId: string;
    invoiceNumber: string;
    items: InvoiceEmailItem[];
    totalAmount: string;
  }): Promise<void> {
    const rows = items
      .map(
        (item) => `<tr>
          <td style="padding: 6px 0; font-size: 14px; color: #111827;">${item.name} × ${item.quantity}</td>
          <td style="padding: 6px 0; font-size: 14px; color: #111827; text-align: right;">R${item.priceAtOrder}</td>
        </tr>`,
      )
      .join('');

    return this.send(
      to,
      `Invoice ${invoiceNumber}`,
      wrap(
        `Thanks for your order, ${firstName}`,
        `<p style="color: #4b5563; font-size: 14px;">Invoice <strong>${invoiceNumber}</strong> for order <strong>${orderId}</strong>.</p>
         <table role="presentation" width="100%" style="margin-top: 12px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
           ${rows}
           <tr>
             <td style="padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 15px; font-weight: 700;">Total</td>
             <td style="padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 15px; font-weight: 700; text-align: right;">R${totalAmount}</td>
           </tr>
         </table>`,
      ),
    );
  }

  sendOrderStatusEmail({
    to,
    firstName,
    orderId,
    status,
  }: {
    to: string;
    firstName: string;
    orderId: string;
    status: 'SHIPPED' | 'DELIVERED';
  }): Promise<void> {
    const copy =
      status === 'SHIPPED'
        ? 'Your order is on its way.'
        : 'Your order has arrived.';

    return this.send(
      to,
      status === 'SHIPPED'
        ? 'Your order has shipped'
        : 'Your order was delivered',
      wrap(
        `Hi ${firstName}, ${copy}`,
        `<p style="color: #4b5563; font-size: 14px;">Order <strong>${orderId}</strong> was just marked as <strong>${status.toLowerCase()}</strong>.</p>`,
      ),
    );
  }
}
