import { Component, input } from '@angular/core';

@Component({
  selector: 'app-club-user-summary',
  templateUrl: './club-user-summary.html',
  styleUrl: './club-user-summary.css'
})
export class ClubUserSummaryComponent {
  readonly name = input.required<string>();
  readonly secondaryText = input.required<string>();
  readonly initials = input.required<string>();
}
