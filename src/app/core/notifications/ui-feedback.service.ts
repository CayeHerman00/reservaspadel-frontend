import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@app/core/i18n/translate.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);

  showTranslatedAction(labelKey: string): void {
    this.showAction(this.translateService.get(labelKey));
  }

  showAction(label: string): void {
    this.notificationService.show(this.translateService.get('notification.buttonPressed', { button: label }));
  }

  showRequiredField(fieldKey: string): void {
    this.notificationService.show(
      this.translateService.get('notification.fieldMissing', { field: this.translateService.get(fieldKey) }),
      'error'
    );
  }

  showInvalidCredentials(): void {
    this.notificationService.show(this.translateService.get('notification.invalidCredentials'), 'error');
  }

  showUnknownError(): void {
    this.notificationService.show(this.translateService.get('notification.unknownError'), 'error');
  }

  showValidationErrors(errors: string[]): void {
    errors.forEach(error => this.notificationService.show(error, 'error'));
  }

  showLoginSuccess(name: string): void {
    this.notificationService.show(this.translateService.get('notification.loginSuccess', { name }), 'success');
  }

  showRegisterSuccess(name: string): void {
    this.notificationService.show(this.translateService.get('notification.registerSuccess', { name }), 'success');
  }

  showUserAlreadyExists(): void {
    this.notificationService.show(this.translateService.get('notification.userAlreadyExists'), 'error');
  }

  showPasswordMismatch(): void {
    this.notificationService.show(this.translateService.get('notification.passwordMismatch'), 'error');
  }

  showLogoutSuccess(): void {
    this.notificationService.show(this.translateService.get('notification.logoutSuccess'), 'success');
  }

  showEmailRegistered(value: string): void {
    this.notificationService.show(this.translateService.get('notification.emailSent', { value }), 'success');
  }

  showEmailAlreadySubscribed(): void {
    this.notificationService.show(this.translateService.get('notification.emailAlreadySubscribed'), 'error');
  }

  showCourtSaved(name: string): void {
    this.notificationService.show(this.translateService.get('notification.courtSaved', { value: name }));
  }

  showCourtApiUnavailable(): void {
    this.notificationService.show(this.translateService.get('notification.courtApiUnavailable'), 'error');
  }

  showCourtFilterPending(courtName: string): void {
    this.notificationService.show(
      this.translateService.get('notification.courtFilterPending', { value: courtName }),
      'warning'
    );
  }

  showCalendarDateContext(dateLabel: string): void {
    this.notificationService.show(
      this.translateService.get('notification.calendarDateContext', { value: dateLabel }),
      'info',
      2200
    );
  }

  showPastDateReadOnly(): void {
    this.notificationService.show(this.translateService.get('notification.pastDateReadOnly'), 'error');
  }
}
