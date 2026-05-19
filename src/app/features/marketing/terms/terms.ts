import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterBarComponent } from '@app/shared/ui/footer-bar/footer-bar';
import { PublicNavbarLink, PublicTopNavbarComponent } from '@app/shared/ui/public-top-navbar/public-top-navbar';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';

@Component({
  selector: 'app-terms-page',
  imports: [PublicTopNavbarComponent, FooterBarComponent, RouterLink],
  templateUrl: './terms.html',
  styleUrl: './terms.css'
})
export class TermsPage {
  readonly appRoutes = APP_ROUTES;

  readonly navbarLinks: PublicNavbarLink[] = [
    { id: 'pricing', labelKey: 'common.services', route: this.appRoutes.pricing },
    { id: 'about', labelKey: 'common.about' },
  ];

  onNavbarLinkSelected(_linkId: string): void {}
}
