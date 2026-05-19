import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@app/core/auth/auth.service';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { UiFeedbackService } from '@app/core/notifications/ui-feedback.service';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';
import { AuthShellComponent } from '@app/shared/ui/auth-shell/auth-shell';
import { hasText, normalizeText } from '@app/shared/utils/text.utils';
import { Country, MatTelInput } from 'mat-tel-input';

@Component({
  selector: 'app-register-page',
  imports: [AuthShellComponent, TranslatePipe, FormsModule, MatTelInput, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterPage {
  readonly appRoutes = APP_ROUTES;

  private readonly feedback = inject(UiFeedbackService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  email = '';
  phone = '';
  phonePlaceholder = ' ';
  password = '';
  confirmPassword = '';
  emailError = false;
  phoneError = false;
  passwordError = false;
  confirmPasswordError = false;
  isSubmitting = false;

  submitRegistration(): void {
    const normalizedEmail = normalizeText(this.email);
    const normalizedPhone = normalizeText(this.phone);
    this.emailError = false;
    this.phoneError = false;
    this.passwordError = false;
    this.confirmPasswordError = false;
    let hasError = false;

    if (!hasText(normalizedEmail)) {
      this.emailError = true;
      this.feedback.showRequiredField('login.email');
      hasError = true;
    }

    if (!hasText(normalizedPhone)) {
      this.phoneError = true;
      this.feedback.showRequiredField('register.phone');
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
        email: normalizedEmail,
        phone: normalizedPhone,
        password: this.password,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: user => {
          this.feedback.showRegisterSuccess(user.email);
          this.router.navigate([this.appRoutes.login]);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.emailError = true;
            this.phoneError = true;
            this.feedback.showUserAlreadyExists();
            return;
          }

          if (error.status === 400) {
            const errors: string[] = error.error?.errors ?? [];
            if (errors.length > 0) {
              this.feedback.showValidationErrors(errors);
              return;
            }
          }

          this.feedback.showUnknownError();
        }
      });
  }

  onCountryChanged(country: Country): void {
    const full = country.placeHolder?.toString() ?? '';
    const prefix = `+${country.dialCode}`;
    this.phonePlaceholder = full.startsWith(prefix) ? full.slice(prefix.length) : full;
  }

  onContactSupport(): void {
    this.feedback.showTranslatedAction('login.contactSupport');
  }
}
