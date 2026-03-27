import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { NotificationService } from '../../shared/notification/notification.service';

@Component({
  selector: 'app-registro-interesados',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './registro-interesados.html',
  styleUrl: './registro-interesados.css'
})
export class RegistroInteresados {
  ts = inject(TranslateService);
  ns = inject(NotificationService);

  interesadosEmail = '';
  emailError = false;

  onNotificarme(): void {
    this.emailError = false;
    if (!this.interesadosEmail.trim()) {
      this.emailError = true;
      this.ns.show(
        this.ts.get('notification.fieldMissing', { field: this.ts.get('login.email') }),
        'error'
      );
      return;
    }
    this.ns.show(this.ts.get('notification.emailSent', { value: this.interesadosEmail }));
    this.interesadosEmail = '';
  }

  onNavLink(label: string): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: label }));
  }

  onFooterLink(label: string): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: label }));
  }
}
