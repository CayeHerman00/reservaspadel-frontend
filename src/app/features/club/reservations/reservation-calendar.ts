import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { CourtManagementService } from '@app/features/club/courts/data-access/court-management.service';
import { Court } from '@app/features/club/courts/data-access/court-management.models';
import { ClubWorkspacePage } from '@app/features/club/shared/club-workspace-page';
import { FooterBarComponent } from '@app/shared/ui/footer-bar/footer-bar';
import { ClubDatePickerComponent } from '@app/shared/ui/club-date-picker/club-date-picker';
import { ClubPageTopbarComponent } from '@app/shared/ui/club-page-topbar/club-page-topbar';
import { SidebarComponent } from '@app/shared/ui/sidebar/sidebar';
import { formatDate, isPastIsoDate, isValidIsoDate, shiftIsoDate, toIsoDate } from '@app/shared/utils/date.utils';
import {
  ReservationCalendarCourt,
  ReservationCalendarItem,
  ReservationCalendarSnapshot,
  ReservationType,
} from './data-access/reservation-calendar.models';
import { ReservationCalendarService } from './data-access/reservation-calendar.service';

@Component({
  selector: 'app-reservation-calendar-page',
  imports: [SidebarComponent, FooterBarComponent, ClubPageTopbarComponent, ClubDatePickerComponent, TranslatePipe],
  templateUrl: './reservation-calendar.html',
  styleUrl: './reservation-calendar.css'
})
export class ReservationCalendarPage extends ClubWorkspacePage implements OnInit {
  private static readonly ALL_COURTS_FILTER = 'ALL';
  private readonly courtManagementService = inject(CourtManagementService);
  private readonly reservationCalendarService = inject(ReservationCalendarService);
  private route = inject(ActivatedRoute);

  selectedDate = toIsoDate(new Date());
  selectedCourtFilterId = ReservationCalendarPage.ALL_COURTS_FILTER;
  isFallback = false;
  courtFilterCourts: Court[] = [];
  calendarData: ReservationCalendarSnapshot = this.reservationCalendarService.emptySnapshot();
  readonly timeSlots = Array.from({ length: 12 }, (_, index) => `${String(index + 8).padStart(2, '0')}:00`);

  ngOnInit(): void {
    const dateFromQuery = this.route.snapshot.queryParamMap.get('date');
    if (dateFromQuery && isValidIsoDate(dateFromQuery)) {
      this.selectedDate = dateFromQuery;
    }

    this.syncDateQueryParam();
    this.loadCourtFilterOptions();
    this.loadCalendar();
  }

  get selectedDateLabel(): string {
    return formatDate(`${this.selectedDate}T00:00:00`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  get todayDateIso(): string {
    return toIsoDate(new Date());
  }

  get occupancyLabel(): string {
    return `${this.calendarData.summary.occupancyPercentage}%`;
  }

  get fixedReservationsLabel(): string {
    return `${this.calendarData.summary.fixedReservations}`;
  }

  get activeCourtsLabel(): string {
    return `${this.calendarData.summary.activeCourts}`;
  }

  get allCourtsFilterId(): string {
    return ReservationCalendarPage.ALL_COURTS_FILTER;
  }

  get selectedCourtFilterLabel(): string {
    if (this.selectedCourtFilterId === ReservationCalendarPage.ALL_COURTS_FILTER) {
      return this.translateService.get('calendar.allCourts');
    }

    return this.courtFilterOptions.find(court => String(court.id) === this.selectedCourtFilterId)?.name
      ?? this.translateService.get('calendar.allCourts');
  }

  get courtFilterOptions(): Array<Pick<Court, 'id' | 'name'>> {
    const mergedCourts = [
      ...this.courtFilterCourts.map(court => ({ id: court.id, name: court.name })),
      ...this.calendarData.courts.map(court => ({ id: court.id, name: court.name })),
    ];

    return Array.from(
      new Map(mergedCourts.map(court => [court.id, court])).values()
    );
  }

  get estimatedRevenueLabel(): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(this.calendarData.summary.estimatedRevenue);
  }

  get displayedCourts(): ReservationCalendarCourt[] {
    return this.calendarData.courts;
  }

  get hasCalendarData(): boolean {
    return this.displayedCourts.length > 0;
  }

  get gridTemplateColumns(): string {
    return `80px repeat(${Math.max(this.displayedCourts.length, 1)}, minmax(220px, 1fr))`;
  }

  get emptyStateDescription(): string {
    return this.translateService.get(this.isFallback ? 'calendar.emptyFallbackDescription' : 'calendar.emptyDescription');
  }

  get isSelectedDatePast(): boolean {
    return isPastIsoDate(this.selectedDate);
  }

  onPrev(): void {
    this.updateSelectedDate(shiftIsoDate(this.selectedDate, -1));
  }

  onNext(): void {
    this.updateSelectedDate(shiftIsoDate(this.selectedDate, 1));
  }

  onToday(): void {
    const todayDateIso = this.todayDateIso;
    if (this.selectedDate === todayDateIso) {
      this.syncDateQueryParam();
      this.loadCalendar();
      this.feedback.showCalendarDateContext(this.selectedDateLabel);
      return;
    }

    this.updateSelectedDate(todayDateIso);
  }

  onNewReservation(): void {
    if (this.isSelectedDatePast) {
      this.feedback.showPastDateReadOnly();
      return;
    }

    this.feedback.showTranslatedAction('sidebar.newReservation');
  }

  onDateInputChange(dateIso: string): void {
    if (!isValidIsoDate(dateIso) || dateIso === this.selectedDate) {
      return;
    }

    this.updateSelectedDate(dateIso);
  }

  onCourtFilterChange(courtFilterId: string): void {
    if (!courtFilterId || courtFilterId === ReservationCalendarPage.ALL_COURTS_FILTER) {
      this.selectedCourtFilterId = ReservationCalendarPage.ALL_COURTS_FILTER;
      return;
    }

    const selectedCourtName = this.courtFilterOptions.find(court => String(court.id) === courtFilterId)?.name
      ?? this.translateService.get('common.noData');
    this.selectedCourtFilterId = ReservationCalendarPage.ALL_COURTS_FILTER;
    this.feedback.showCourtFilterPending(selectedCourtName);
  }

  onFab(): void {
    if (this.isSelectedDatePast) {
      this.feedback.showPastDateReadOnly();
      return;
    }

    this.feedback.showTranslatedAction('sidebar.newReservation');
  }

  onReservation(title: string): void {
    this.feedback.showAction(title);
  }

  reservationsForCourt(courtId: number): ReservationCalendarItem[] {
    return this.calendarData.reservations.filter(reservation => reservation.courtId === courtId);
  }

  reservationTop(reservation: ReservationCalendarItem): number {
    const startMinutes = this.timeToMinutes(reservation.startTime);
    const calendarStartMinutes = 8 * 60;
    return Math.max(0, ((startMinutes - calendarStartMinutes) / 60) * 64);
  }

  reservationHeight(reservation: ReservationCalendarItem): number {
    const duration = this.timeToMinutes(reservation.endTime) - this.timeToMinutes(reservation.startTime);
    return Math.max(64, (duration / 60) * 64);
  }

  reservationCardClass(type: ReservationType): string {
    return type === 'FIXED'
      ? 'absolute left-2 right-2 rounded-lg border-l-4 border-secondary-container bg-secondary-container/10 p-3 text-left transition-all'
      : 'absolute left-2 right-2 rounded-lg border-l-4 border-primary-container bg-primary-container/20 p-3 text-left transition-all';
  }

  reservationTypeClass(type: ReservationType): string {
    return type === 'FIXED'
      ? 'text-[10px] font-black uppercase text-secondary-fixed'
      : 'text-[10px] font-black uppercase text-primary';
  }

  reservationTypeLabel(type: ReservationType): string {
    return this.translateService.get(type === 'FIXED' ? 'calendar.type.fixed' : 'calendar.type.punctual');
  }

  reservationIcon(reservation: ReservationCalendarItem): string {
    return reservation.icon ?? (reservation.type === 'FIXED' ? 'repeat' : 'event');
  }

  private loadCalendar(): void {
    this.reservationCalendarService.getSnapshot(this.selectedDate).subscribe(result => {
      this.calendarData = result.data;
      this.isFallback = result.isFallback;
    });
  }

  private loadCourtFilterOptions(): void {
    this.courtManagementService.getCourts().subscribe(result => {
      this.courtFilterCourts = result.data;
    });
  }

  private updateSelectedDate(dateIso: string): void {
    this.selectedDate = dateIso;
    this.syncDateQueryParam();
    this.loadCalendar();
    this.feedback.showCalendarDateContext(this.selectedDateLabel);
  }

  private syncDateQueryParam(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date: this.selectedDate },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(part => Number(part));
    return ((Number.isFinite(hours) ? hours : 0) * 60) + (Number.isFinite(minutes) ? minutes : 0);
  }
}
