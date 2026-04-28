import { Component, inject } from '@angular/core';
import { Notification, NotificationService, NotificationType } from './notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  template: `
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
      @for (n of ns.notifications(); track n.id) {
        <div
          class="animate-slide-in flex items-center gap-3 rounded-xl px-6 py-4 text-sm font-bold shadow-2xl"
          [class]="notificationClasses(n)"
        >
          <span class="material-symbols-outlined text-lg">
            {{ notificationIcon(n.type) }}
          </span>
          <span class="flex-1">{{ n.message }}</span>
          <button (click)="ns.dismiss(n.id)" class="opacity-70 hover:opacity-100">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class NotificationComponent {
  ns = inject(NotificationService);

  notificationClasses(notification: Notification): string {
    switch (notification.type) {
      case 'success':
        return 'border border-green-400/30 bg-green-600 text-white';
      case 'info':
        return 'border border-white/10 bg-slate-800/95 text-slate-100';
      case 'warning':
        return 'border border-amber-300/40 bg-amber-500 text-slate-950';
      default:
        return 'border border-red-400/30 bg-red-600 text-white';
    }
  }

  notificationIcon(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'info':
        return 'calendar_month';
      case 'warning':
        return 'warning';
      default:
        return 'error';
    }
  }
}
