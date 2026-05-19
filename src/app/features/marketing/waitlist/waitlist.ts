import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { UiFeedbackService } from '@app/core/notifications/ui-feedback.service';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';
import { FooterBarComponent } from '@app/shared/ui/footer-bar/footer-bar';
import { PublicNavbarLink, PublicTopNavbarComponent } from '@app/shared/ui/public-top-navbar/public-top-navbar';
import { hasText, normalizeText } from '@app/shared/utils/text.utils';
import { WaitlistService } from './waitlist.service';

@Component({
  selector: 'app-waitlist-page',
  imports: [PublicTopNavbarComponent, FooterBarComponent, FormsModule, TranslatePipe],
  templateUrl: './waitlist.html',
  styleUrl: './waitlist.css'
})
export class WaitlistPage implements OnInit {
  private readonly feedback = inject(UiFeedbackService);
  private readonly waitlistService = inject(WaitlistService);
  readonly appRoutes = APP_ROUTES;

  waitlistEmail = '';
  emailError = false;
  isSubmitting = false;
  readonly waitlistCount = signal<number>(0);
  readonly navbarLinks: PublicNavbarLink[] = [
    { id: 'pricing', labelKey: 'interesados.pricing', route: this.appRoutes.pricing },
    { id: 'about', labelKey: 'common.about' },
  ];

  ngOnInit(): void {
    this.waitlistService.getCount().subscribe(count => this.waitlistCount.set(count));
  }

  onWaitlistSubmit(): void {
    const normalizedEmail = normalizeText(this.waitlistEmail);
    this.emailError = false;

    if (!hasText(normalizedEmail)) {
      this.emailError = true;
      this.feedback.showRequiredField('login.email');
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.waitlistService.subscribe(normalizedEmail).subscribe({
      next: () => {
        this.feedback.showEmailRegistered(normalizedEmail);
        this.waitlistEmail = '';
        this.waitlistCount.update(c => c + 1);
        this.isSubmitting = false;
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 409) {
          this.feedback.showEmailAlreadySubscribed();
        } else {
          this.feedback.showUnknownError();
        }
        this.isSubmitting = false;
      }
    });
  }

  onNavbarLinkSelected(linkId: string): void {
    const labelKeyById: Record<string, string> = {
      about: 'common.about',
    };

    this.feedback.showTranslatedAction(labelKeyById[linkId] ?? linkId);
  }
}
