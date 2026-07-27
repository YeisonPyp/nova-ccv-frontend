import { Injectable, signal } from '@angular/core';

export type NotificationType = 'error' | 'success' | 'info' | 'warning';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title?: string;
  message: string;
}

/**
 * Global notification store. Fed by the HTTP error interceptor (and anywhere
 * else) and rendered as floating toast cards by the toast container.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private seq = 0;
  readonly notifications = signal<AppNotification[]>([]);

  push(
    type: NotificationType,
    message: string,
    title?: string,
    timeoutMs = 6000,
  ): number {
    const id = ++this.seq;
    this.notifications.update((list) => [
      ...list,
      { id, type, message, title },
    ]);
    if (timeoutMs > 0) {
      setTimeout(() => this.dismiss(id), timeoutMs);
    }
    return id;
  }

  error(message: string, title = 'Error'): number {
    return this.push('error', message, title);
  }

  success(message: string, title?: string): number {
    return this.push('success', message, title);
  }

  info(message: string, title?: string): number {
    return this.push('info', message, title);
  }

  warning(message: string, title?: string): number {
    return this.push('warning', message, title);
  }

  dismiss(id: number): void {
    this.notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clear(): void {
    this.notifications.set([]);
  }
}
