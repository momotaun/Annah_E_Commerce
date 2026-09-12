import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { PrismaService } from '../../prisma/prisma.service';
import type { PushNotification, PushNotifier } from './push-notifier.interface';

@Injectable()
export class FirebasePushNotifier implements PushNotifier, OnModuleInit {
  private readonly logger = new Logger(FirebasePushNotifier.name);
  private app: App | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0];
      return;
    }
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) return;

    try {
      const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
      this.app = initializeApp({ credential: cert(serviceAccount) });
    } catch (err) {
      this.logger.error(
        'Failed to initialize Firebase Admin — check FIREBASE_SERVICE_ACCOUNT_JSON',
        err instanceof Error ? err.stack : err,
      );
    }
  }

  async sendToUser(
    userId: string,
    notification: PushNotification,
  ): Promise<void> {
    if (!this.app) return;

    const tokens = await this.prisma.pushToken.findMany({
      where: { userId },
      select: { id: true, token: true },
    });
    if (tokens.length === 0) return;

    const response = await getMessaging(this.app).sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: { title: notification.title, body: notification.body },
      data: notification.data,
    });

    // A token stops being valid when the app is uninstalled or FCM rotates
    // it — clean those up so we stop paying the round-trip on every send.
    const staleTokenIds = response.responses
      .map((result, index) => ({ result, id: tokens[index].id }))
      .filter(
        ({ result }) =>
          !result.success &&
          (result.error?.code ===
            'messaging/registration-token-not-registered' ||
            result.error?.code === 'messaging/invalid-registration-token'),
      )
      .map(({ id }) => id);

    if (staleTokenIds.length > 0) {
      await this.prisma.pushToken.deleteMany({
        where: { id: { in: staleTokenIds } },
      });
    }
  }
}
