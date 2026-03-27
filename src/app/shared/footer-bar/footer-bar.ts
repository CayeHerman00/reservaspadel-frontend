import { Component } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';

interface FooterLink {
  href: string;
  labelKey: string;
  accent?: boolean;
}

@Component({
  selector: 'app-footer-bar',
  imports: [TranslatePipe],
  templateUrl: './footer-bar.html',
  styleUrl: './footer-bar.css'
})
export class FooterBarComponent {
  readonly links: FooterLink[] = [
    { href: '/privacy', labelKey: 'common.privacy' },
    { href: '/terms', labelKey: 'common.terms' },
    { href: '/contact', labelKey: 'common.contact' },
    { href: '/help', labelKey: 'common.help', accent: true },
  ];
}
