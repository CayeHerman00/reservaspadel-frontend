import { Component, inject, OnInit } from '@angular/core';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { ClubWorkspacePage } from '@app/features/club/shared/club-workspace-page';
import { FooterBarComponent } from '@app/shared/ui/footer-bar/footer-bar';
import { ClubPageTopbarComponent } from '@app/shared/ui/club-page-topbar/club-page-topbar';
import { SidebarComponent } from '@app/shared/ui/sidebar/sidebar';
import { buildMonthGrid, formatDate, MonthGridDay, startOfDay, toIsoDate } from '@app/shared/utils/date.utils';
import { DashboardOverviewService } from './data-access/dashboard-overview.service';
import { DashboardSummary, UpcomingReservation } from './data-access/dashboard-overview.models';

@Component({
  selector: 'app-dashboard-page',
  imports: [SidebarComponent, FooterBarComponent, ClubPageTopbarComponent, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardPage extends ClubWorkspacePage implements OnInit {
  private readonly dashboardOverviewService = inject(DashboardOverviewService);

  dashboardData: DashboardSummary = this.dashboardOverviewService.emptyDashboardSummary();
  isDashboardFallback = false;
  isUpcomingFallback = false;
  currentMonthLabel = '';
  selectedDate = startOfDay(new Date());
  calendarViewDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
  selectedUpcomingReservations: UpcomingReservation[] = [];
  miniCalendarDays: MonthGridDay[] = [];
  readonly miniCalendarWeekdays = [
    'calendar.day.mon',
    'calendar.day.tue',
    'calendar.day.wed',
    'calendar.day.thu',
    'calendar.day.fri',
    'calendar.day.sat',
    'calendar.day.sun',
  ];

  ngOnInit(): void {
    this.loadDashboard();
    this.buildMiniCalendar(this.calendarViewDate);
    this.loadUpcomingReservationsForSelectedDate();
  }

  get welcomeMessage(): string {
    return `${this.translateService.get('dashboard.welcomePrefix')}, ${this.currentUserName}.`;
  }

  get monthlyGrowthLabel(): string {
    if (this.dashboardData.monthlyGrowthPercentage === null) {
      return this.translateService.get('dashboard.stats.noHistory');
    }

    const prefix = this.dashboardData.monthlyGrowthPercentage > 0 ? '+' : '';
    return `${prefix}${this.dashboardData.monthlyGrowthPercentage}%`;
  }

  get activeCourtsLabel(): string {
    if (!this.dashboardData.totalCourts) {
      return '0';
    }

    return `${this.dashboardData.activeCourts}/${this.dashboardData.totalCourts}`;
  }

  get occupancyLabel(): string {
    return `${this.dashboardData.occupancyPercentage}%`;
  }

  get occupancyBarWidth(): string {
    return `${this.dashboardData.occupancyPercentage}%`;
  }

  get peakTimeLabel(): string {
    return this.dashboardData.peakTime ?? this.translateService.get('common.noData');
  }

  get hasUpcomingReservations(): boolean {
    return this.selectedUpcomingReservations.length > 0;
  }

  get selectedDateLabel(): string {
    return formatDate(this.selectedDate, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  get isSelectedDatePast(): boolean {
    return this.selectedDate.getTime() < startOfDay(new Date()).getTime();
  }

  get reservationsSectionTitle(): string {
    return this.translateService.get(
      this.isSelectedDatePast ? 'dashboard.history.title' : 'dashboard.upcoming.title'
    );
  }

  get emptyReservationsTitle(): string {
    return this.translateService.get(
      this.isSelectedDatePast ? 'dashboard.history.emptyTitle' : 'dashboard.upcoming.emptyTitle'
    );
  }

  get emptyReservationsDescription(): string {
    if (this.isSelectedDatePast) {
      return this.translateService.get(
        this.isUpcomingFallback
          ? 'dashboard.history.emptyFallbackDescription'
          : 'dashboard.history.emptyDescription'
      );
    }

    return this.translateService.get(
      this.isUpcomingFallback
        ? 'dashboard.upcoming.emptyFallbackDescription'
        : 'dashboard.upcoming.emptyDescription'
    );
  }

  onNewReservation(): void {
    this.feedback.showTranslatedAction('sidebar.newReservation');
  }

  onAddCourt(): void {
    this.router.navigate([this.appRoutes.courts], {
      queryParams: { modal: 'new-court' },
    });
  }

  onPreviousMonth(): void {
    const previousMonth = new Date(this.calendarViewDate.getFullYear(), this.calendarViewDate.getMonth() - 1, 1);
    this.buildMiniCalendar(previousMonth);
  }

  onNextMonth(): void {
    const nextMonth = new Date(this.calendarViewDate.getFullYear(), this.calendarViewDate.getMonth() + 1, 1);
    this.buildMiniCalendar(nextMonth);
  }

  onSelectCalendarDay(day: MonthGridDay): void {
    this.selectedDate = startOfDay(day.date);
    this.buildMiniCalendar(day.date);
    this.loadUpcomingReservationsForSelectedDate();
  }

  onViewAll(): void {
    this.router.navigate([this.appRoutes.calendar], {
      queryParams: { date: toIsoDate(this.selectedDate) },
    });
  }

  onContactSupport(): void {
    this.feedback.showTranslatedAction('dashboard.support.button');
  }

  formatUpcomingTime(reservation: UpcomingReservation): string {
    if (!reservation.startDateTime) {
      return this.translateService.get('common.noData');
    }

    const parsedDate = new Date(reservation.startDateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return this.translateService.get('common.noData');
    }

    return formatDate(parsedDate, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  formatUpcomingDay(reservation: UpcomingReservation): string {
    if (!reservation.startDateTime) {
      return this.translateService.get('dashboard.upcoming.pendingDay');
    }

    const parsedDate = new Date(reservation.startDateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return this.translateService.get('dashboard.upcoming.pendingDay');
    }

    return formatDate(parsedDate, {
      day: '2-digit',
      month: 'short',
    });
  }

  private loadDashboard(): void {
    this.dashboardOverviewService.getDashboardSummary().subscribe(result => {
      this.dashboardData = result.data;
      this.isDashboardFallback = result.isFallback;
    });
  }

  private loadUpcomingReservationsForSelectedDate(): void {
    this.dashboardOverviewService.getUpcomingReservationsByDate(toIsoDate(this.selectedDate)).subscribe(result => {
      this.selectedUpcomingReservations = result.data;
      this.isUpcomingFallback = result.isFallback;
    });
  }

  private buildMiniCalendar(referenceDate: Date): void {
    const formattedMonth = formatDate(referenceDate, {
      month: 'long',
      year: 'numeric',
    });

    this.currentMonthLabel = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);
    this.calendarViewDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    this.miniCalendarDays = buildMonthGrid(referenceDate, this.selectedDate);
  }
}
