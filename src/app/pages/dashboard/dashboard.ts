import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { AuthService } from '../../shared/auth/auth.service';
import { ClubDataService, DashboardSummary, UpcomingReservation } from '../../shared/club-data/club-data.service';
import { FooterBarComponent } from '../../shared/footer-bar/footer-bar';
import { NotificationService } from '../../shared/notification/notification.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar';

interface MiniCalendarDay {
  date: Date;
  dateIso: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, FooterBarComponent, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private translateService = inject(TranslateService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private clubDataService = inject(ClubDataService);
  private router = inject(Router);

  sidebarCollapsed = false;
  dashboardData: DashboardSummary = this.clubDataService.emptyDashboardSummary();
  isDashboardFallback = false;
  isUpcomingFallback = false;
  currentMonthLabel = '';
  selectedDate = this.startOfDay(new Date());
  calendarViewDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
  selectedUpcomingReservations: UpcomingReservation[] = [];
  miniCalendarDays: MiniCalendarDay[] = [];
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

  get userName(): string {
    return this.authService.getCurrentSession()?.name ?? this.translateService.get('common.user');
  }

  get userRole(): string {
    const session = this.authService.getCurrentSession();
    return session ? this.authService.getDisplayRole(session.role) : this.translateService.get('dashboard.userRoleEmpty');
  }

  get welcomeMessage(): string {
    return `${this.translateService.get('dashboard.welcomePrefix')}, ${this.userName}.`;
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
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.selectedDate);
  }

  get isSelectedDatePast(): boolean {
    return this.selectedDate.getTime() < this.startOfDay(new Date()).getTime();
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
    this.notificationService.show(this.translateService.get('sidebar.newReservation') + ' clicked', 'success');
  }

  onSupport(): void {
    this.notificationService.show(this.translateService.get('common.support') + ' clicked', 'success');
  }

  onLogout(): void {
    this.authService.logout();
    this.notificationService.show(this.translateService.get('notification.logoutSuccess'), 'success');
    this.router.navigate(['/login']);
  }

  onSettings(): void {
    this.notificationService.show(this.translateService.get('sidebar.settings') + ' clicked', 'success');
  }

  onAddCourt(): void {
    this.router.navigate(['/courts'], {
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

  onSelectCalendarDay(day: MiniCalendarDay): void {
    this.selectedDate = this.startOfDay(day.date);
    this.buildMiniCalendar(day.date);
    this.loadUpcomingReservationsForSelectedDate();
  }

  onViewAll(): void {
    this.router.navigate(['/calendar'], {
      queryParams: { date: this.toIsoDate(this.selectedDate) },
    });
  }

  onContactSupport(): void {
    this.notificationService.show(this.translateService.get('dashboard.support.button') + ' clicked', 'success');
  }

  formatUpcomingTime(reservation: UpcomingReservation): string {
    if (!reservation.startDateTime) {
      return this.translateService.get('common.noData');
    }

    const parsedDate = new Date(reservation.startDateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return this.translateService.get('common.noData');
    }

    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(parsedDate);
  }

  formatUpcomingDay(reservation: UpcomingReservation): string {
    if (!reservation.startDateTime) {
      return this.translateService.get('dashboard.upcoming.pendingDay');
    }

    const parsedDate = new Date(reservation.startDateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return this.translateService.get('dashboard.upcoming.pendingDay');
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
    }).format(parsedDate);
  }

  private loadDashboard(): void {
    this.clubDataService.getDashboardSummary().subscribe(result => {
      this.dashboardData = result.data;
      this.isDashboardFallback = result.isFallback;
    });
  }

  private loadUpcomingReservationsForSelectedDate(): void {
    this.clubDataService.getUpcomingReservationsByDate(this.toIsoDate(this.selectedDate)).subscribe(result => {
      this.selectedUpcomingReservations = result.data;
      this.isUpcomingFallback = result.isFallback;
    });
  }

  private buildMiniCalendar(referenceDate: Date): void {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const today = new Date();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    const leadingDays = (firstDayOfMonth.getDay() + 6) % 7;
    const calendarDays: MiniCalendarDay[] = [];

    for (let index = leadingDays - 1; index >= 0; index -= 1) {
      const date = new Date(year, month - 1, daysInPreviousMonth - index);
      calendarDays.push({
        date,
        dateIso: this.toIsoDate(date),
        dayNumber: daysInPreviousMonth - index,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, this.selectedDate),
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      calendarDays.push({
        date,
        dateIso: this.toIsoDate(date),
        dayNumber: day,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, this.selectedDate),
      });
    }

    let trailingDay = 1;
    while (calendarDays.length < 35 || calendarDays.length % 7 !== 0) {
      const date = new Date(year, month + 1, trailingDay);
      calendarDays.push({
        date,
        dateIso: this.toIsoDate(date),
        dayNumber: trailingDay,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, this.selectedDate),
      });
      trailingDay += 1;
    }

    const formattedMonth = new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric',
    }).format(referenceDate);

    this.currentMonthLabel = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);
    this.calendarViewDate = new Date(year, month, 1);
    this.miniCalendarDays = calendarDays;
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private isSameDay(left: Date, right: Date): boolean {
    return left.getFullYear() === right.getFullYear()
      && left.getMonth() === right.getMonth()
      && left.getDate() === right.getDate();
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
