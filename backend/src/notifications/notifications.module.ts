import { Global, Module } from '@nestjs/common';
import { ConsolePushNotifier } from './console.push-notifier';
import { FirebasePushNotifier } from './firebase.push-notifier';

export const PUSH_NOTIFIER = 'PUSH_NOTIFIER';

// Global (like MailerModule) so any module that needs to notify a user —
// payments, vendor-orders, and whatever's next — just @Inject(PUSH_NOTIFIER)
// without also importing this module.
@Global()
@Module({
  providers: [
    ConsolePushNotifier,
    FirebasePushNotifier,
    {
      provide: PUSH_NOTIFIER,
      // FIREBASE_SERVICE_ACCOUNT_JSON presence is the switch — same
      // pattern as MAILER picking Resend vs console by RESEND_API_KEY.
      useFactory: (
        console: ConsolePushNotifier,
        firebase: FirebasePushNotifier,
      ) => (process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? firebase : console),
      inject: [ConsolePushNotifier, FirebasePushNotifier],
    },
  ],
  exports: [PUSH_NOTIFIER],
})
export class NotificationsModule {}
