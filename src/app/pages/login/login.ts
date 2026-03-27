import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { AuthService } from '../../shared/auth/auth.service';
import { NotificationService } from '../../shared/notification/notification.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, TranslatePipe, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  ts = inject(TranslateService);
  ns = inject(NotificationService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  authService = inject(AuthService);

  username = this.route.snapshot.queryParamMap.get('username') ?? '';
  password = '';
  usernameError = false;
  passwordError = false;
  isSubmitting = false;

  onLogin(): void {
    this.usernameError = false;
    this.passwordError = false;
    let hasError = false;

    if (!this.username.trim()) {
      this.usernameError = true;
      this.ns.show(this.ts.get('notification.fieldMissing', { field: this.ts.get('login.username') }), 'error');
      hasError = true;
    }

    if (!this.password.trim()) {
      this.passwordError = true;
      this.ns.show(this.ts.get('notification.fieldMissing', { field: this.ts.get('login.password') }), 'error');
      hasError = true;
    }

    if (hasError || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService
      .login(this.username.trim(), this.password)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: session => {
          this.ns.show(this.ts.get('notification.loginSuccess', { name: session.name }), 'success');
          this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.usernameError = true;
            this.passwordError = true;
            this.ns.show(this.ts.get('notification.invalidCredentials'), 'error');
            return;
          }

          this.ns.show(this.ts.get('notification.unknownError'), 'error');
        }
      });
  }

  onForgotPassword(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('login.forgot') }));
  }

  onContactSupport(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('login.contactSupport') }));
  }
}
