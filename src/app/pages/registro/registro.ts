import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { AuthService } from '../../shared/auth/auth.service';
import { NotificationService } from '../../shared/notification/notification.service';

@Component({
  selector: 'app-registro',
  imports: [RouterLink, TranslatePipe, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  ts = inject(TranslateService);
  ns = inject(NotificationService);
  router = inject(Router);
  authService = inject(AuthService);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  usernameError = false;
  emailError = false;
  passwordError = false;
  confirmPasswordError = false;
  isSubmitting = false;

  onRegister(): void {
    this.usernameError = false;
    this.emailError = false;
    this.passwordError = false;
    this.confirmPasswordError = false;
    let hasError = false;

    if (!this.username.trim()) {
      this.usernameError = true;
      this.ns.show(this.ts.get('notification.fieldMissing', { field: this.ts.get('login.username') }), 'error');
      hasError = true;
    }

    if (!this.email.trim()) {
      this.emailError = true;
      this.ns.show(this.ts.get('notification.fieldMissing', { field: this.ts.get('login.email') }), 'error');
      hasError = true;
    }

    if (!this.password.trim()) {
      this.passwordError = true;
      this.ns.show(this.ts.get('notification.fieldMissing', { field: this.ts.get('login.password') }), 'error');
      hasError = true;
    }

    if (!this.confirmPassword.trim()) {
      this.confirmPasswordError = true;
      this.ns.show(this.ts.get('notification.fieldMissing', { field: this.ts.get('register.confirmPassword') }), 'error');
      hasError = true;
    }

    if (this.password && this.confirmPassword && this.password !== this.confirmPassword) {
      this.passwordError = true;
      this.confirmPasswordError = true;
      this.ns.show(this.ts.get('notification.passwordMismatch'), 'error');
      hasError = true;
    }

    if (hasError || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService
      .register({
        username: this.username.trim(),
        email: this.email.trim(),
        password: this.password,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: user => {
          this.ns.show(this.ts.get('notification.registerSuccess', { name: user.name }), 'success');
          this.router.navigate(['/login'], { queryParams: { username: user.name } });
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.usernameError = true;
            this.emailError = true;
            this.ns.show(this.ts.get('notification.userAlreadyExists'), 'error');
            return;
          }

          this.ns.show(this.ts.get('notification.unknownError'), 'error');
        }
      });
  }

  onContactSupport(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('login.contactSupport') }));
  }
}
