import { Injectable, Logger } from '@nestjs/common';
import type { PushNotification, PushNotifier } from './push-notifier.interface';

// Fallback when no Firebase service account is configured — logs instead
// of sending, exactly like ConsoleMailer does for email. No credentials
// needed, so local dev works without a Firebase project.
@Injectable()
export class ConsolePushNotifier implements PushNotifier {
  private readonly logger = new Logger(ConsolePushNotifier.name);

  sendToUser(userId: string, notification: PushNotification): Promise<void> {
    this.logger.log(
      `[push→${userId}] ${notification.title}: ${notification.body}`,
    );
    return Promise.resolve();
  }
}
