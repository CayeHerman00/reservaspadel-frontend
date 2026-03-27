import { Component, ElementRef, HostListener, computed, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-top-navbar-landing',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './top-navbar-landing.html',
  styleUrl: './top-navbar-landing.css'
})
export class TopNavbarLandingComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly servicesClick = output<void>();
  readonly aboutClick = output<void>();
  readonly userMenuOpen = signal(false);
  readonly session = computed(() => this.authService.session());
  readonly userInitials = computed(() => {
    const currentSession = this.session();
    if (!currentSession) {
      return 'U';
    }

    const initials = currentSession.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');

    return initials || 'U';
  });
  readonly userRole = computed(() => {
    const currentSession = this.session();
    return currentSession
      ? this.authService.getDisplayRole(currentSession.role)
      : this.translateService.get('dashboard.userRoleEmpty');
  });

  onServices(): void {
    this.servicesClick.emit();
    this.closeUserMenu();
  }

  onAbout(): void {
    this.aboutClick.emit();
    this.closeUserMenu();
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen.update(isOpen => !isOpen);
  }

  goToDashboard(): void {
    this.closeUserMenu();
    this.router.navigate(['/dashboard']);
  }

  goToCourts(): void {
    this.closeUserMenu();
    this.router.navigate(['/courts']);
  }

  goToCalendar(): void {
    this.closeUserMenu();
    this.router.navigate(['/calendar']);
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.notificationService.show(this.translateService.get('notification.logoutSuccess'), 'success');
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.userMenuOpen()) {
      return;
    }

    const target = event.target as Node | null;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.closeUserMenu();
    }
  }

  private closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }
}
