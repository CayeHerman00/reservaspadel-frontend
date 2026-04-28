import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { UiFeedbackService } from '@app/core/notifications/ui-feedback.service';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';
import { FooterBarComponent } from '@app/shared/ui/footer-bar/footer-bar';
import { PublicNavbarLink, PublicTopNavbarComponent } from '@app/shared/ui/public-top-navbar/public-top-navbar';
import { hasText, normalizeText } from '@app/shared/utils/text.utils';

@Component({
  selector: 'app-waitlist-page',
  imports: [PublicTopNavbarComponent, FooterBarComponent, FormsModule, TranslatePipe],
  templateUrl: './waitlist.html',
  styleUrl: './waitlist.css'
})
export class WaitlistPage {
  private readonly feedback = inject(UiFeedbackService);
  readonly appRoutes = APP_ROUTES;

  waitlistEmail = '';
  emailError = false;
  readonly navbarLinks: PublicNavbarLink[] = [
    { id: 'pricing', labelKey: 'interesados.pricing', route: this.appRoutes.pricing },
    { id: 'about', labelKey: 'common.about' },
  ];

  onWaitlistSubmit(): void {
    const normalizedEmail = normalizeText(this.waitlistEmail);
    this.emailError = false;
    if (!hasText(normalizedEmail)) {
      this.emailError = true;
      this.feedback.showRequiredField('login.email');
      return;
    }

    this.feedback.showEmailRegistered(normalizedEmail);
    this.waitlistEmail = '';
  }

  onNavbarLinkSelected(linkId: string): void {
    const labelKeyById: Record<string, string> = {
      about: 'common.about',
    };

    this.feedback.showTranslatedAction(labelKeyById[linkId] ?? linkId);
  }
}
