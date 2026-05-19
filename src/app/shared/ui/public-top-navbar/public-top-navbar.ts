import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { UiFeedbackService } from '@app/core/notifications/ui-feedback.service';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';
import { buildUserInitials } from '@app/shared/utils/user.utils';

export interface PublicNavbarLink {
  id: string;
  labelKey: string;
  route?: string;
}

@Component({
  selector: 'app-public-top-navbar',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './public-top-navbar.html',
  styleUrl: './public-top-navbar.css'
})
export class PublicTopNavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly appRoutes = APP_ROUTES;
  readonly navigationLinks = input<PublicNavbarLink[]>([]);
  readonly linkSelected = output<string>();
  readonly userMenuOpen = signal(false);
  readonly session = computed(() => this.authService.session());
  readonly userInitials = computed(() => {
    const currentSession = this.session();
    if (!currentSession) {
      return 'U';
    }

    return buildUserInitials(currentSession.name);
  });

  onLinkSelected(link: PublicNavbarLink): void {
    if (link.route) {
      this.router.navigateByUrl(link.route);
      this.closeUserMenu();
      return;
    }

    this.linkSelected.emit(link.id);
    this.closeUserMenu();
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen.update(isOpen => !isOpen);
  }

  goToDashboard(): void {
    this.closeUserMenu();
    this.router.navigateByUrl(this.appRoutes.dashboard);
  }

  goToCourts(): void {
    this.closeUserMenu();
    this.router.navigateByUrl(this.appRoutes.courts);
  }

  goToCalendar(): void {
    this.closeUserMenu();
    this.router.navigateByUrl(this.appRoutes.calendar);
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.feedback.showLogoutSuccess();
    this.router.navigateByUrl(this.appRoutes.home);
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

  goHome(event: MouseEvent): void {
    event.preventDefault();
    this.router.navigateByUrl(this.appRoutes.home).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  private closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }
}
