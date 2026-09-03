import { Global, Module } from '@nestjs/common';
import { ConsoleMailer } from './console.mailer';
import { ResendMailer } from './resend.mailer';

export const MAILER = 'MAILER';

// Global (like PrismaModule) so every module that needs to send an email —
// auth, checkout, vendor-orders, and whatever's next — just @Inject(MAILER)
// without also having to import this module themselves.
@Global()
@Module({
  providers: [
    ConsoleMailer,
    ResendMailer,
    {
      provide: MAILER,
      // RESEND_API_KEY presence is the switch — no separate "which mailer"
      // env var needed, since ConsoleMailer needs no credentials at all.
      useFactory: (console: ConsoleMailer, resend: ResendMailer) =>
        process.env.RESEND_API_KEY ? resend : console,
      inject: [ConsoleMailer, ResendMailer],
    },
  ],
  exports: [MAILER],
})
export class MailerModule {}
