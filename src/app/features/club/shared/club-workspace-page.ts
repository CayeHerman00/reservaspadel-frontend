import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { TranslateService } from '@app/core/i18n/translate.service';
import { UiFeedbackService } from '@app/core/notifications/ui-feedback.service';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';
import { buildUserInitials } from '@app/shared/utils/user.utils';

export abstract class ClubWorkspacePage {
  readonly appRoutes = APP_ROUTES;
  protected readonly authService = inject(AuthService);
  protected readonly translateService = inject(TranslateService);
  protected readonly feedback = inject(UiFeedbackService);
  protected readonly router = inject(Router);

  sidebarCollapsed = false;

  get currentUserName(): string {
    return this.authService.getCurrentSession()?.name ?? this.translateService.get('common.user');
  }

  get currentUserEmail(): string {
    return this.authService.getCurrentSession()?.email ?? this.translateService.get('common.noData');
  }

  get currentUserInitials(): string {
    return buildUserInitials(this.currentUserName);
  }

  onSupport(): void {
    this.feedback.showTranslatedAction('common.support');
  }

  onSettings(): void {
    this.feedback.showTranslatedAction('sidebar.settings');
  }

  onLogout(): void {
    this.authService.logout();
    this.feedback.showLogoutSuccess();
    this.router.navigateByUrl(this.appRoutes.login);
  }
}
