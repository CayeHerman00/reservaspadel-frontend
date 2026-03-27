import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { AuthService } from '../../shared/auth/auth.service';
import { FooterBarComponent } from '../../shared/footer-bar/footer-bar';
import { NotificationService } from '../../shared/notification/notification.service';
import { TopNavbarLandingComponent } from '../../shared/top-navbar-landing/top-navbar-landing';

@Component({
  selector: 'app-landing',
  imports: [TopNavbarLandingComponent, FooterBarComponent, TranslatePipe, FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  ts = inject(TranslateService);
  ns = inject(NotificationService);
  router = inject(Router);
  authService = inject(AuthService);

  leadEmail = '';
  leadEmailError = false;

  onApuntarse(): void {
    if (!this.leadEmail.trim()) {
      this.leadEmailError = true;
      this.ns.show(this.ts.get('notification.fieldMissing', { field: 'email' }), 'error');
      return;
    }
    this.leadEmailError = false;
    this.ns.show(this.ts.get('notification.emailSent', { value: this.leadEmail }));
  }

  onSolicitar(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('landing.hero.cta') }));
  }

  onOpenControlPanel(): void {
    this.router.navigate([this.authService.getCurrentSession() ? '/dashboard' : '/login']);
  }

  onVerDemostracion(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('landing.services.control.button') }));
  }

  onModuloCRM(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('landing.services.members.link') }));
  }

  onCtaSolicitar(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('landing.cta.primary') }));
  }

  onHablarConVentas(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('landing.cta.secondary') }));
  }

  onFooterLink(key: string): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get(key) }));
  }
}
