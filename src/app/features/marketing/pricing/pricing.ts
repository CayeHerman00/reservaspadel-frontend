import { Component, inject } from '@angular/core';
import { UiFeedbackService } from '@app/core/notifications/ui-feedback.service';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';
import { FooterBarComponent } from '@app/shared/ui/footer-bar/footer-bar';
import { PublicNavbarLink, PublicTopNavbarComponent } from '@app/shared/ui/public-top-navbar/public-top-navbar';

@Component({
  selector: 'app-pricing-page',
  imports: [PublicTopNavbarComponent, FooterBarComponent],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css'
})
export class PricingPage {
  readonly appRoutes = APP_ROUTES;
  private readonly feedback = inject(UiFeedbackService);

  readonly navbarLinks: PublicNavbarLink[] = [
    { id: 'pricing', labelKey: 'common.services', route: this.appRoutes.pricing },
    { id: 'about', labelKey: 'common.about' },
  ];

  onNavbarLinkSelected(linkId: string): void {
    switch (linkId) {
      case 'about':
        this.feedback.showTranslatedAction('common.about');
        break;
      default:
        this.feedback.showAction(linkId);
    }
  }
}
