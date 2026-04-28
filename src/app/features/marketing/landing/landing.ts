import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { UiFeedbackService } from '@app/core/notifications/ui-feedback.service';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';
import { FooterBarComponent } from '@app/shared/ui/footer-bar/footer-bar';
import { PublicNavbarLink, PublicTopNavbarComponent } from '@app/shared/ui/public-top-navbar/public-top-navbar';

@Component({
  selector: 'app-landing-page',
  imports: [PublicTopNavbarComponent, FooterBarComponent, TranslatePipe],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingPage {
  readonly appRoutes = APP_ROUTES;
  private readonly feedback = inject(UiFeedbackService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly navbarLinks: PublicNavbarLink[] = [
    { id: 'pricing', labelKey: 'common.services', route: this.appRoutes.pricing },
    { id: 'about', labelKey: 'common.about' },
  ];

  onLeadCaptureClick(): void {
    this.router.navigateByUrl(this.appRoutes.waitlist);
  }

  onNavbarLinkSelected(linkId: string): void {
    switch (linkId) {
      case 'about':
        this.feedback.showTranslatedAction('common.about');
        break;
      default:
        this.feedback.showAction(linkId);
    }
  }

  onPrimaryCallToAction(): void {
    this.feedback.showTranslatedAction('landing.hero.cta');
  }

  onOpenControlPanel(): void {
    this.router.navigateByUrl(this.authService.getCurrentSession() ? this.appRoutes.dashboard : this.appRoutes.login);
  }

  onViewDemo(): void {
    this.feedback.showTranslatedAction('landing.services.control.button');
  }

  onOpenCrmModule(): void {
    this.feedback.showTranslatedAction('landing.services.members.link');
  }

  onCtaPrimary(): void {
    this.feedback.showTranslatedAction('landing.cta.primary');
  }

  onCtaSecondary(): void {
    this.feedback.showTranslatedAction('landing.cta.secondary');
  }
}
