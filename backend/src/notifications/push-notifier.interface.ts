export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushNotifier {
  /** Fans out to every device the user has registered. No-ops silently if
   * they have none — a user who never opened the app on a device with
   * notifications enabled simply won't have any PushToken rows. */
  sendToUser(userId: string, notification: PushNotification): Promise<void>;
}
