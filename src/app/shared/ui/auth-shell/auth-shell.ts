import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';

type AuthTab = 'login' | 'register';

@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.css'
})
export class AuthShellComponent {
  readonly appRoutes = APP_ROUTES;
  readonly activeTab = input<AuthTab>('login');
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input.required<string>();
  readonly compact = input(false);

  readonly supportClick = output<void>();
}
