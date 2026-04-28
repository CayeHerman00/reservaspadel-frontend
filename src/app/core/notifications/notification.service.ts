import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private counter = 0;

  show(message: string, type: NotificationType = 'success', duration = 3000): void {
    const id = ++this.counter;
    this.notifications.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }
}
