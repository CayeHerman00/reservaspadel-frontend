import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { FOOTER_NAVIGATION_LINKS } from '@app/shared/navigation/app-navigation';

@Component({
  selector: 'app-footer-bar',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer-bar.html',
  styleUrl: './footer-bar.css'
})
export class FooterBarComponent {
  readonly links = FOOTER_NAVIGATION_LINKS;
}
