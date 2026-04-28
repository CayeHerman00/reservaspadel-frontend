import { Component } from '@angular/core';
import { ClubWorkspacePage } from '@app/features/club/shared/club-workspace-page';
import { SidebarComponent } from '@app/shared/ui/sidebar/sidebar';

@Component({
  selector: 'app-configurator-page',
  imports: [SidebarComponent],
  templateUrl: './configurator.html',
  styleUrl: './configurator.css'
})
export class ConfiguratorPage extends ClubWorkspacePage {
  onPrimaryAction(): void {
    this.feedback.showTranslatedAction('sidebar.newReservation');
  }
}
