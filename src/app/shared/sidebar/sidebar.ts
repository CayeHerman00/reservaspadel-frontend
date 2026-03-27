import { Component, input, model, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';

type SidebarSection = 'home' | 'courts' | 'calendar';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  readonly activeSection = input<SidebarSection>('home');
  readonly courtsRoute = input('/courts');
  readonly courtsLabelKey = input('sidebar.courts');
  readonly primaryActionLabelKey = input('sidebar.newReservation');
  readonly primaryActionIcon = input('add');
  readonly collapsed = model(false);

  readonly primaryActionClick = output<void>();
  readonly supportClick = output<void>();
  readonly logoutClick = output<void>();
  readonly settingsClick = output<void>();

  private readonly activeNavClass =
    'flex items-center gap-3 bg-[#0052FF] text-white rounded-lg px-4 py-3 shadow-[0_0_20px_rgba(0,82,255,0.3)] font-body font-medium text-sm transition-all active:scale-98';

  private readonly inactiveNavClass =
    'flex items-center gap-3 text-[#c3c5d9] px-4 py-3 hover:bg-[#37393d] hover:translate-x-1 rounded-lg font-body font-medium text-sm transition-all active:scale-98';

  toggleCollapsed(): void {
    this.collapsed.set(!this.collapsed());
  }

  navClass(section: SidebarSection): string {
    return this.activeSection() === section ? this.activeNavClass : this.inactiveNavClass;
  }
}
