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
  selector: 'app-register-page',
  imports: [AuthShellComponent, TranslatePipe, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterPage {
  readonly appRoutes = APP_ROUTES;
  private readonly feedback = inject(UiFeedbackService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  usernameError = false;
  emailError = false;
  passwordError = false;
  confirmPasswordError = false;
  isSubmitting = false;

  submitRegistration(): void {
    const normalizedUsername = normalizeText(this.username);
    const normalizedEmail = normalizeText(this.email);
    this.usernameError = false;
    this.emailError = false;
    this.passwordError = false;
    this.confirmPasswordError = false;
    let hasError = false;

    if (!hasText(normalizedUsername)) {
      this.usernameError = true;
      this.feedback.showRequiredField('login.username');
      hasError = true;
    }

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

    if (!this.confirmPassword.trim()) {
      this.confirmPasswordError = true;
      this.feedback.showRequiredField('register.confirmPassword');
      hasError = true;
    }

    if (this.password && this.confirmPassword && this.password !== this.confirmPassword) {
      this.passwordError = true;
      this.confirmPasswordError = true;
      this.feedback.showPasswordMismatch();
      hasError = true;
    }

    if (hasError || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.authService
      .register({
        username: normalizedUsername,
        email: normalizedEmail,
        password: this.password,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: user => {
          this.feedback.showRegisterSuccess(user.name);
          this.router.navigate([this.appRoutes.login], { queryParams: { username: user.name } });
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.usernameError = true;
            this.emailError = true;
            this.feedback.showUserAlreadyExists();
            return;
          }

          this.feedback.showUnknownError();
        }
      });
  }

  onContactSupport(): void {
    this.feedback.showTranslatedAction('login.contactSupport');
  }
}
