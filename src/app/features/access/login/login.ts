import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@app/core/auth/auth.service';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { UiFeedbackService } from '@app/core/notifications/ui-feedback.service';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';
import { AuthShellComponent } from '@app/shared/ui/auth-shell/auth-shell';
import { hasText, normalizeText } from '@app/shared/utils/text.utils';

@Component({
  selector: 'app-login-page',
  imports: [AuthShellComponent, TranslatePipe, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage {
  readonly appRoutes = APP_ROUTES;
  private readonly feedback = inject(UiFeedbackService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  email = '';
  password = '';
  emailError = false;
  passwordError = false;
  isSubmitting = false;

  submitLogin(): void {
    const normalizedEmail = normalizeText(this.email);
    this.emailError = false;
    this.passwordError = false;
    let hasError = false;

    if (!hasText(normalizedEmail)) {
      this.emailError = true;
      this.feedback.showRequiredField('login.email');
      hasError = true;
    }

    if (!this.password.trim()) {
      this.passwordError = true;
      this.feedback.showRequiredField('login.password');
      hasError = true;
    }

    if (hasError || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService
      .login(normalizedEmail, this.password)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: session => {
          this.feedback.showLoginSuccess(session.name);
          this.router.navigateByUrl(this.appRoutes.dashboard);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.emailError = true;
            this.passwordError = true;
            this.feedback.showInvalidCredentials();
            return;
          }

          this.feedback.showUnknownError();
        }
      });
  }

  requestPasswordRecovery(): void {
    this.feedback.showTranslatedAction('login.forgot');
  }

  onContactSupport(): void {
    this.feedback.showTranslatedAction('login.contactSupport');
  }
}
