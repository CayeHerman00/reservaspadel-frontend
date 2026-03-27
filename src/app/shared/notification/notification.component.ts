import { Component, inject } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  template: `
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
      @for (n of ns.notifications(); track n.id) {
        <div
          class="px-6 py-4 rounded-xl shadow-2xl text-white font-bold text-sm flex items-center gap-3 animate-slide-in"
          [class]="n.type === 'success'
            ? 'bg-green-600 border border-green-400/30'
            : 'bg-red-600 border border-red-400/30'"
        >
          <span class="material-symbols-outlined text-lg">
            {{ n.type === 'success' ? 'check_circle' : 'error' }}
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
}
