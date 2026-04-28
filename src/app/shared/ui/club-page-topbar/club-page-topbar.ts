import { Component, input } from '@angular/core';
import { ClubUserSummaryComponent } from '@app/shared/ui/club-user-summary/club-user-summary';

@Component({
  selector: 'app-club-page-topbar',
  imports: [ClubUserSummaryComponent],
  templateUrl: './club-page-topbar.html',
  styleUrl: './club-page-topbar.css'
})
export class ClubPageTopbarComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly userName = input.required<string>();
  readonly userSecondaryText = input.required<string>();
  readonly userInitials = input.required<string>();
}
