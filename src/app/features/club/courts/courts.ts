import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { FooterBarComponent } from '@app/shared/ui/footer-bar/footer-bar';
import { ClubPageTopbarComponent } from '@app/shared/ui/club-page-topbar/club-page-topbar';
import { SidebarComponent } from '@app/shared/ui/sidebar/sidebar';
import { ClubWorkspacePage } from '@app/features/club/shared/club-workspace-page';
import { hasText, normalizeText } from '@app/shared/utils/text.utils';
import { CourtManagementService } from './data-access/court-management.service';
import { Court, CourtStatus } from './data-access/court-management.models';

@Component({
  selector: 'app-courts-page',
  imports: [SidebarComponent, FooterBarComponent, ClubPageTopbarComponent, FormsModule, TranslatePipe],
  templateUrl: './courts.html',
  styleUrl: './courts.css'
})
export class CourtsPage extends ClubWorkspacePage implements OnInit {
  private readonly courtManagementService = inject(CourtManagementService);
  private route = inject(ActivatedRoute);

  readonly surfaceOptionKeys = [
    'courts.modal.surface1',
    'courts.modal.surface2',
    'courts.modal.surface3',
    'courts.modal.surface4',
  ];

  isCreateCourtModalOpen = false;
  courtName = '';
  hasCourtNameError = false;
  searchQuery = '';
  selectedSurfaceKey = this.surfaceOptionKeys[0];
  hasLedLighting = false;
  hasCover = false;
  isSavingCourt = false;
  courtList: Court[] = [];
  isDataFallback = false;

  ngOnInit(): void {
    this.loadCourts();

    if (this.route.snapshot.queryParamMap.get('modal') === 'new-court') {
      this.openCreateCourtModal();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { modal: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  get filteredCourts(): Court[] {
    const normalizedQuery = normalizeText(this.searchQuery).toLowerCase();

    if (!normalizedQuery) {
      return this.courtList;
    }

    return this.courtList.filter(court =>
      court.name.toLowerCase().includes(normalizedQuery) ||
      (court.details ?? '').toLowerCase().includes(normalizedQuery)
    );
  }

  get activeCourtsCount(): number {
    return this.courtList.filter(court => court.status === 'AVAILABLE' || court.status === 'IN_PLAY').length;
  }

  get activeCountLabel(): string {
    return `${this.activeCourtsCount} ${this.translateService.get('courts.activeCountLabel')}`;
  }

  get emptyStateTitle(): string {
    return hasText(this.searchQuery)
      ? this.translateService.get('courts.emptySearchTitle')
      : this.translateService.get('courts.emptyTitle');
  }

  get emptyStateDescription(): string {
    if (hasText(this.searchQuery)) {
      return this.translateService.get('courts.emptySearchDescription');
    }

    return this.translateService.get(this.isDataFallback ? 'courts.apiPendingDescription' : 'courts.emptyDescription');
  }

  openCreateCourtModal(): void {
    this.isCreateCourtModalOpen = true;
    this.courtName = '';
    this.hasCourtNameError = false;
    this.selectedSurfaceKey = this.surfaceOptionKeys[0];
    this.hasLedLighting = false;
    this.hasCover = false;
    this.isSavingCourt = false;
  }

  closeCreateCourtModal(): void {
    if (this.isSavingCourt) {
      return;
    }

    this.isCreateCourtModalOpen = false;
  }

  submitCourt(): void {
    const normalizedCourtName = normalizeText(this.courtName);
    this.hasCourtNameError = false;
    if (!hasText(normalizedCourtName)) {
      this.hasCourtNameError = true;
      this.feedback.showRequiredField('courts.modal.nameLabel');
      return;
    }

    this.isSavingCourt = true;
    this.courtManagementService.createCourt({
      name: normalizedCourtName,
      surface: this.translateService.get(this.selectedSurfaceKey),
      features: [
        ...(this.hasLedLighting ? [this.translateService.get('courts.modal.featureLed')] : []),
        ...(this.hasCover ? [this.translateService.get('courts.modal.featureCover')] : []),
      ],
    }).subscribe({
      next: createdCourt => {
        this.courtList = [...this.courtList, createdCourt];
        this.isDataFallback = false;
        this.isSavingCourt = false;
        this.feedback.showCourtSaved(createdCourt.name);
        this.closeCreateCourtModal();
      },
      error: () => {
        this.isSavingCourt = false;
        this.feedback.showCourtApiUnavailable();
      },
    });
  }

  editCourt(name: string): void {
    this.feedback.showAction(`${this.translateService.get('courts.edit')} - ${name}`);
  }

  deleteCourt(name: string): void {
    this.feedback.showAction(`${this.translateService.get('courts.delete')} - ${name}`);
  }

  showSearchFeedback(): void {
    this.feedback.showTranslatedAction('common.search');
  }

  showNotificationsFeedback(): void {
    this.feedback.showTranslatedAction('common.notifications');
  }

  changeViewMode(mode: string): void {
    this.feedback.showAction(mode);
  }

  courtStatusLabel(status: CourtStatus): string {
    switch (status) {
      case 'AVAILABLE':
        return this.translateService.get('courts.status.available');
      case 'IN_PLAY':
        return this.translateService.get('courts.status.inPlay');
      case 'MAINTENANCE':
        return this.translateService.get('courts.status.maintenance');
      default:
        return this.translateService.get('common.noData');
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
    this.courtManagementService.getCourts().subscribe(result => {
      this.courtList = result.data;
      this.isDataFallback = result.isFallback;
    });
  }
}
