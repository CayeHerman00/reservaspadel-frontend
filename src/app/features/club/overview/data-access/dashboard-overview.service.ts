import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ReservationCalendarSnapshot } from '@app/features/club/reservations/data-access/reservation-calendar.models';
import { ReservationCalendarService } from '@app/features/club/reservations/data-access/reservation-calendar.service';
import { ClubApiBase } from '@app/features/club/shared/data-access/club-api.base';
import { clampPercentage, toNullableNumber, toNullableText, toNumber, toText } from '@app/features/club/shared/data-access/club-api-mapper.utils';
import { DashboardOverviewResult, DashboardSummary, UpcomingReservation } from './dashboard-overview.models';

type DashboardSummaryResponse = Partial<{
  totalReservas: number;
  crecimientoMensual: number | null;
  pistasActivas: number;
  totalPistas: number;
  ocupacionMedia: number;
  horaPico: string | null;
  proximasReservas: UpcomingReservationResponse[];
}>;

type UpcomingReservationResponse = Partial<{
  id: string | number;
  titulo: string;
  subtitulo: string | null;
  fechaHoraInicio: string | null;
  asistentes: number | null;
}>;

@Injectable({ providedIn: 'root' })
export class DashboardOverviewService extends ClubApiBase {
  private readonly reservationCalendarService = inject(ReservationCalendarService);

  getDashboardSummary(): Observable<DashboardOverviewResult<DashboardSummary>> {
    return this.http
      .get<DashboardSummaryResponse>(`${this.apiBaseUrl}/dashboard/resumen`, { headers: this.createHeaders() })
      .pipe(
        map(response => ({
          data: this.mapDashboardSummary(response),
          isFallback: false,
        })),
        catchError(() =>
          of({
            data: this.emptyDashboardSummary(),
            isFallback: true,
          })
        )
      );
  }

  getUpcomingReservationsByDate(dateIso: string): Observable<DashboardOverviewResult<UpcomingReservation[]>> {
    return this.reservationCalendarService.getSnapshot(dateIso).pipe(
      map(result => ({
        data: this.mapSnapshotToUpcomingReservations(result.data, dateIso),
        isFallback: result.isFallback,
      }))
    );
  }

  emptyDashboardSummary(): DashboardSummary {
    return {
      totalReservations: 0,
      monthlyGrowthPercentage: null,
      activeCourts: 0,
      totalCourts: 0,
      occupancyPercentage: 0,
      peakTime: null,
      upcomingReservations: [],
    };
  }

  private mapDashboardSummary(response: DashboardSummaryResponse): DashboardSummary {
    return {
      totalReservations: toNumber(response.totalReservas),
      monthlyGrowthPercentage: toNullableNumber(response.crecimientoMensual),
      activeCourts: toNumber(response.pistasActivas),
      totalCourts: toNumber(response.totalPistas),
      occupancyPercentage: clampPercentage(response.ocupacionMedia),
      peakTime: toNullableText(response.horaPico),
      upcomingReservations: (response.proximasReservas ?? []).map(item => this.mapUpcomingReservation(item)),
    };
  }

  private mapUpcomingReservation(response: UpcomingReservationResponse): UpcomingReservation {
    return {
      id: String(response.id ?? crypto.randomUUID()),
      title: toText(response.titulo, 'Reserva'),
      subtitle: toNullableText(response.subtitulo),
      startDateTime: toNullableText(response.fechaHoraInicio),
      attendeesCount: toNullableNumber(response.asistentes),
    };
  }

  private mapSnapshotToUpcomingReservations(
    snapshot: ReservationCalendarSnapshot,
    dateIso: string
  ): UpcomingReservation[] {
    const courtNames = new Map(snapshot.courts.map(court => [court.id, court.name]));

    return [...snapshot.reservations]
      .sort((left, right) => left.startTime.localeCompare(right.startTime))
      .map(reservation => ({
        id: reservation.id,
        title: reservation.title,
        subtitle: courtNames.get(reservation.courtId) ?? null,
        startDateTime: `${dateIso}T${reservation.startTime}:00`,
        attendeesCount: null,
      }));
  }
}
