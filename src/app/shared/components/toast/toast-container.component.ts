import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AppNotification,
  NotificationService,
} from '@/app/core/services/notification.service';

/**
 * Floating notification cards, stacked at the bottom-right of the viewport.
 * Reads from {@link NotificationService}.
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
})
export class ToastContainerComponent {
  private readonly service = inject(NotificationService);
  readonly notifications = this.service.notifications;

  dismiss(id: number) {
    this.service.dismiss(id);
  }

  styles(type: AppNotification['type']): { bar: string; icon: string } {
    switch (type) {
      case 'success':
        return { bar: 'bg-green-500', icon: 'text-green-600' };
      case 'warning':
        return { bar: 'bg-amber-500', icon: 'text-amber-600' };
      case 'info':
        return { bar: 'bg-blue-500', icon: 'text-blue-600' };
      default:
        return { bar: 'bg-red-500', icon: 'text-red-600' };
    }
  }
}
