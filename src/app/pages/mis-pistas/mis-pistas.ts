import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { AuthService } from '../../shared/auth/auth.service';
import { ClubDataService, Court, CourtStatus } from '../../shared/club-data/club-data.service';
import { FooterBarComponent } from '../../shared/footer-bar/footer-bar';
import { NotificationService } from '../../shared/notification/notification.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-mis-pistas',
  imports: [SidebarComponent, FooterBarComponent, FormsModule, TranslatePipe],
  templateUrl: './mis-pistas.html',
  styleUrl: './mis-pistas.css'
})
export class MisPistas implements OnInit {
  private ts = inject(TranslateService);
  private ns = inject(NotificationService);
  private authService = inject(AuthService);
  private clubDataService = inject(ClubDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly surfaceOptionKeys = [
    'courts.modal.surface1',
    'courts.modal.surface2',
    'courts.modal.surface3',
    'courts.modal.surface4',
  ];

  sidebarCollapsed = false;
  showModal = false;
  courtName = '';
  courtNameError = false;
  searchQuery = '';
  selectedSurfaceKey = this.surfaceOptionKeys[0];
  hasLedLighting = false;
  hasCover = false;
  isSavingCourt = false;
  courts: Court[] = [];
  isFallback = false;

  ngOnInit(): void {
    this.loadCourts();

    if (this.route.snapshot.queryParamMap.get('modal') === 'new-court') {
      this.openModal();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { modal: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  get userName(): string {
    return this.authService.getCurrentSession()?.name ?? this.ts.get('common.user');
  }

  get userInitials(): string {
    const initials = this.userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');

    return initials || 'U';
  }

  get filteredCourts(): Court[] {
    const normalizedQuery = this.searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return this.courts;
    }

    return this.courts.filter(court =>
      court.name.toLowerCase().includes(normalizedQuery) ||
      (court.details ?? '').toLowerCase().includes(normalizedQuery)
    );
  }

  get activeCourtsCount(): number {
    return this.courts.filter(court => court.status === 'AVAILABLE' || court.status === 'IN_PLAY').length;
  }

  get activeCountLabel(): string {
    return `${this.activeCourtsCount} ${this.ts.get('courts.activeCountLabel')}`;
  }

  get emptyStateTitle(): string {
    return this.searchQuery.trim()
      ? this.ts.get('courts.emptySearchTitle')
      : this.ts.get('courts.emptyTitle');
  }

  get emptyStateDescription(): string {
    if (this.searchQuery.trim()) {
      return this.ts.get('courts.emptySearchDescription');
    }

    return this.ts.get(this.isFallback ? 'courts.apiPendingDescription' : 'courts.emptyDescription');
  }

  openModal(): void {
    this.showModal = true;
    this.courtName = '';
    this.courtNameError = false;
    this.selectedSurfaceKey = this.surfaceOptionKeys[0];
    this.hasLedLighting = false;
    this.hasCover = false;
    this.isSavingCourt = false;
  }

  closeModal(): void {
    if (this.isSavingCourt) {
      return;
    }

    this.showModal = false;
  }

  onGuardarPista(): void {
    this.courtNameError = false;
    if (!this.courtName.trim()) {
      this.courtNameError = true;
      this.ns.show(
        this.ts.get('notification.fieldMissing', { field: this.ts.get('courts.modal.nameLabel') }),
        'error'
      );
      return;
    }

    this.isSavingCourt = true;
    this.clubDataService.createCourt({
      name: this.courtName.trim(),
      surface: this.ts.get(this.selectedSurfaceKey),
      features: [
        ...(this.hasLedLighting ? [this.ts.get('courts.modal.featureLed')] : []),
        ...(this.hasCover ? [this.ts.get('courts.modal.featureCover')] : []),
      ],
    }).subscribe({
      next: createdCourt => {
        this.courts = [...this.courts, createdCourt];
        this.isFallback = false;
        this.isSavingCourt = false;
        this.ns.show(this.ts.get('notification.courtSaved', { value: createdCourt.name }));
        this.closeModal();
      },
      error: () => {
        this.isSavingCourt = false;
        this.ns.show(this.ts.get('notification.courtApiUnavailable'), 'error');
      },
    });
  }

  onEditCourt(name: string): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: `${this.ts.get('courts.edit')} - ${name}` }));
  }

  onDeleteCourt(name: string): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: `${this.ts.get('courts.delete')} - ${name}` }));
  }

  onSearch(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('common.search') }));
  }

  onNotifications(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('common.notifications') }));
  }

  onViewMode(mode: string): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: mode }));
  }

  onSupport(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('common.support') }));
  }

  onLogout(): void {
    this.authService.logout();
    this.ns.show(this.ts.get('notification.logoutSuccess'), 'success');
    this.router.navigate(['/login']);
  }

  onSettings(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('sidebar.settings') }));
  }

  courtStatusLabel(status: CourtStatus): string {
    switch (status) {
      case 'AVAILABLE':
        return this.ts.get('courts.status.available');
      case 'IN_PLAY':
        return this.ts.get('courts.status.inPlay');
      case 'MAINTENANCE':
        return this.ts.get('courts.status.maintenance');
      default:
        return this.ts.get('common.noData');
    }
  }

  courtStatusBadgeClass(status: CourtStatus): string {
    switch (status) {
      case 'AVAILABLE':
        return 'flex items-center gap-1.5 rounded-full border border-[#caf300]/20 bg-[#caf300]/10 px-3 py-1.5';
      case 'IN_PLAY':
        return 'flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5';
      case 'MAINTENANCE':
        return 'flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5';
      default:
        return 'flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5';
    }
  }

  courtStatusTextClass(status: CourtStatus): string {
    switch (status) {
      case 'AVAILABLE':
        return 'text-[10px] font-bold uppercase tracking-wider text-[#caf300]';
      case 'IN_PLAY':
        return 'text-[10px] font-bold uppercase tracking-wider text-blue-500';
      case 'MAINTENANCE':
        return 'text-[10px] font-bold uppercase tracking-wider text-red-500';
      default:
        return 'text-[10px] font-bold uppercase tracking-wider text-white/40';
    }
  }

  courtIcon(status: CourtStatus): string {
    return status === 'MAINTENANCE' ? 'construction' : 'sports_tennis';
  }

  courtIconClass(status: CourtStatus): string {
    return status === 'MAINTENANCE'
      ? 'text-[64px] text-red-500/30 group-hover:text-red-500/50 transition-colors duration-500'
      : 'text-[64px] text-white/10 group-hover:text-blue-500/40 transition-colors duration-500';
  }

  private loadCourts(): void {
    this.clubDataService.getCourts().subscribe(result => {
      this.courts = result.data;
      this.isFallback = result.isFallback;
    });
  }
}
