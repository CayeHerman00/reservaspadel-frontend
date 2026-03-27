import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { AuthService } from '../../shared/auth/auth.service';
import {
  CalendarCourt,
  CalendarReservation,
  CalendarSnapshot,
  ClubDataService,
  ReservationType,
} from '../../shared/club-data/club-data.service';
import { FooterBarComponent } from '../../shared/footer-bar/footer-bar';
import { NotificationService } from '../../shared/notification/notification.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-calendario',
  imports: [SidebarComponent, FooterBarComponent, TranslatePipe],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class Calendario implements OnInit {
  private ts = inject(TranslateService);
  private ns = inject(NotificationService);
  private authService = inject(AuthService);
  private clubDataService = inject(ClubDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  sidebarCollapsed = false;
  selectedDate = this.toIsoDate(new Date());
  isFallback = false;
  calendarData: CalendarSnapshot = this.clubDataService.emptyCalendarSnapshot();
  readonly timeSlots = Array.from({ length: 12 }, (_, index) => `${String(index + 8).padStart(2, '0')}:00`);

  ngOnInit(): void {
    const dateFromQuery = this.route.snapshot.queryParamMap.get('date');
    if (dateFromQuery && this.isValidIsoDate(dateFromQuery)) {
      this.selectedDate = dateFromQuery;
    }

    this.syncDateQueryParam();
    this.loadCalendar();
  }

  get selectedDateLabel(): string {
    const parsedDate = new Date(`${this.selectedDate}T00:00:00`);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
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

  get estimatedRevenueLabel(): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(this.calendarData.summary.estimatedRevenue);
  }

  get displayedCourts(): CalendarCourt[] {
    return this.calendarData.courts;
  }

  get hasCalendarData(): boolean {
    return this.displayedCourts.length > 0;
  }

  get gridTemplateColumns(): string {
    return `80px repeat(${Math.max(this.displayedCourts.length, 1)}, minmax(220px, 1fr))`;
  }

  get emptyStateDescription(): string {
    return this.ts.get(this.isFallback ? 'calendar.emptyFallbackDescription' : 'calendar.emptyDescription');
  }

  get isSelectedDatePast(): boolean {
    return new Date(`${this.selectedDate}T00:00:00`).getTime() < this.startOfToday().getTime();
  }

  onPrev(): void {
    this.updateSelectedDate(this.shiftDate(-1));
  }

  onNext(): void {
    this.updateSelectedDate(this.shiftDate(1));
  }

  onToday(): void {
    this.updateSelectedDate(this.toIsoDate(new Date()));
  }

  onNewReservation(): void {
    if (this.isSelectedDatePast) {
      this.ns.show(this.ts.get('notification.pastDateReadOnly'), 'error');
      return;
    }

    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('sidebar.newReservation') }));
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

  onDateFilter(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.selectedDateLabel }));
  }

  onCourtFilter(): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('calendar.allCourts') }));
  }

  onFab(): void {
    if (this.isSelectedDatePast) {
      this.ns.show(this.ts.get('notification.pastDateReadOnly'), 'error');
      return;
    }

    this.ns.show(this.ts.get('notification.buttonPressed', { button: this.ts.get('sidebar.newReservation') }));
  }

  onReservation(title: string): void {
    this.ns.show(this.ts.get('notification.buttonPressed', { button: title }));
  }

  reservationsForCourt(courtId: number): CalendarReservation[] {
    return this.calendarData.reservations.filter(reservation => reservation.courtId === courtId);
  }

  reservationTop(reservation: CalendarReservation): number {
    const startMinutes = this.timeToMinutes(reservation.startTime);
    const calendarStartMinutes = 8 * 60;
    return Math.max(0, ((startMinutes - calendarStartMinutes) / 60) * 64);
  }

  reservationHeight(reservation: CalendarReservation): number {
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
    return this.ts.get(type === 'FIXED' ? 'calendar.type.fixed' : 'calendar.type.punctual');
  }

  reservationIcon(reservation: CalendarReservation): string {
    return reservation.icon ?? (reservation.type === 'FIXED' ? 'repeat' : 'event');
  }

  private loadCalendar(): void {
    this.clubDataService.getCalendarSnapshot(this.selectedDate).subscribe(result => {
      this.calendarData = result.data;
      this.isFallback = result.isFallback;
    });
  }

  private updateSelectedDate(dateIso: string): void {
    this.selectedDate = dateIso;
    this.syncDateQueryParam();
    this.loadCalendar();
  }

  private shiftDate(days: number): string {
    const date = new Date(`${this.selectedDate}T00:00:00`);
    date.setDate(date.getDate() + days);
    return this.toIsoDate(date);
  }

  private syncDateQueryParam(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date: this.selectedDate },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isValidIsoDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
  }

  private startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(part => Number(part));
    return ((Number.isFinite(hours) ? hours : 0) * 60) + (Number.isFinite(minutes) ? minutes : 0);
  }
}
