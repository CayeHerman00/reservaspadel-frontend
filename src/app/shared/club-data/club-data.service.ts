import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export type CourtStatus = 'AVAILABLE' | 'IN_PLAY' | 'MAINTENANCE' | 'UNKNOWN';
export type ReservationType = 'PUNCTUAL' | 'FIXED';

export interface BackendResult<T> {
  data: T;
  isFallback: boolean;
}

export interface UpcomingReservation {
  id: string;
  title: string;
  subtitle: string | null;
  startDateTime: string | null;
  attendeesCount: number | null;
}

export interface DashboardSummary {
  totalReservations: number;
  monthlyGrowthPercentage: number | null;
  activeCourts: number;
  totalCourts: number;
  occupancyPercentage: number;
  peakTime: string | null;
  upcomingReservations: UpcomingReservation[];
}

export interface Court {
  id: number;
  name: string;
  details: string | null;
  status: CourtStatus;
}

export interface CreateCourtPayload {
  name: string;
  surface: string;
  features: string[];
}

export interface CalendarSummary {
  occupancyPercentage: number;
  fixedReservations: number;
  activeCourts: number;
  estimatedRevenue: number;
}

export interface CalendarCourt {
  id: number;
  name: string;
  label: string;
  status: CourtStatus;
}

export interface CalendarReservation {
  id: string;
  courtId: number;
  title: string;
  type: ReservationType;
  startTime: string;
  endTime: string;
  icon: string | null;
}

export interface CalendarSnapshot {
  summary: CalendarSummary;
  courts: CalendarCourt[];
  reservations: CalendarReservation[];
}

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

type CourtCollectionResponse = CourtResponse[] | Partial<{ pistas: CourtResponse[] }>;

type CourtResponse = Partial<{
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string | null;
}>;

type CreateCourtResponse = Partial<{
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string | null;
}>;

type CalendarSnapshotResponse = Partial<{
  resumen: CalendarSummaryResponse;
  pistas: CalendarCourtResponse[];
  reservas: CalendarReservationResponse[];
}>;

type CalendarSummaryResponse = Partial<{
  ocupacionHoy: number;
  reservasFijas: number;
  pistasActivas: number;
  ingresosEstimados: number;
}>;

type CalendarCourtResponse = Partial<{
  id: number;
  nombre: string;
  etiqueta: string;
  estado: string | null;
}>;

type CalendarReservationResponse = Partial<{
  id: string | number;
  pistaId: number;
  titulo: string;
  tipo: string | null;
  horaInicio: string;
  horaFin: string;
  icono: string | null;
}>;

@Injectable({ providedIn: 'root' })
export class ClubDataService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api';

  getDashboardSummary(): Observable<BackendResult<DashboardSummary>> {
    return this.http
      .get<DashboardSummaryResponse>(`${this.apiUrl}/dashboard/resumen`, { headers: this.createHeaders() })
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

  getCourts(): Observable<BackendResult<Court[]>> {
    return this.http
      .get<CourtCollectionResponse>(`${this.apiUrl}/pistas`, { headers: this.createHeaders() })
      .pipe(
        map(response => Array.isArray(response) ? response : response.pistas ?? []),
        map(courts => ({
          data: courts.map((court, index) => this.mapCourt(court, index)),
          isFallback: false,
        })),
        catchError(() =>
          of({
            data: [],
            isFallback: true,
          })
        )
      );
  }

  createCourt(payload: CreateCourtPayload): Observable<Court> {
    return this.http
      .post<CreateCourtResponse>(
        `${this.apiUrl}/pistas`,
        {
          nombre: payload.name,
          superficie: payload.surface,
          extras: payload.features,
        },
        { headers: this.createHeaders() }
      )
      .pipe(map(response => this.mapCourt(response, 0)));
  }

  getCalendarSnapshot(dateIso: string): Observable<BackendResult<CalendarSnapshot>> {
    return this.http
      .get<CalendarSnapshotResponse>(`${this.apiUrl}/reservas/calendario`, {
        headers: this.createHeaders(),
        params: { fecha: dateIso },
      })
      .pipe(
        map(response => ({
          data: this.mapCalendarSnapshot(response),
          isFallback: false,
        })),
        catchError(() =>
          of({
            data: this.emptyCalendarSnapshot(),
            isFallback: true,
          })
        )
      );
  }

  getUpcomingReservationsByDate(dateIso: string): Observable<BackendResult<UpcomingReservation[]>> {
    return this.getCalendarSnapshot(dateIso).pipe(
      map(result => ({
        data: this.mapCalendarReservationsToUpcoming(result.data, dateIso),
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

  emptyCalendarSnapshot(): CalendarSnapshot {
    return {
      summary: {
        occupancyPercentage: 0,
        fixedReservations: 0,
        activeCourts: 0,
        estimatedRevenue: 0,
      },
      courts: [],
      reservations: [],
    };
  }

  private createHeaders(): HttpHeaders {
    const session = this.authService.getCurrentSession();
    if (!session) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `${session.tokenType} ${session.token}`,
    });
  }

  private mapDashboardSummary(response: DashboardSummaryResponse): DashboardSummary {
    return {
      totalReservations: this.toNumber(response.totalReservas),
      monthlyGrowthPercentage: this.toNullableNumber(response.crecimientoMensual),
      activeCourts: this.toNumber(response.pistasActivas),
      totalCourts: this.toNumber(response.totalPistas),
      occupancyPercentage: this.clampPercentage(response.ocupacionMedia),
      peakTime: this.toNullableText(response.horaPico),
      upcomingReservations: (response.proximasReservas ?? []).map(item => this.mapUpcomingReservation(item)),
    };
  }

  private mapUpcomingReservation(response: UpcomingReservationResponse): UpcomingReservation {
    return {
      id: String(response.id ?? crypto.randomUUID()),
      title: this.toText(response.titulo, 'Reserva'),
      subtitle: this.toNullableText(response.subtitulo),
      startDateTime: this.toNullableText(response.fechaHoraInicio),
      attendeesCount: this.toNullableNumber(response.asistentes),
    };
  }

  private mapCourt(response: CourtResponse | CreateCourtResponse, index: number): Court {
    return {
      id: this.toNumber(response.id, index + 1),
      name: this.toText(response.nombre, `Pista ${index + 1}`),
      details: this.toNullableText(response.descripcion),
      status: this.mapCourtStatus(response.estado),
    };
  }

  private mapCalendarSnapshot(response: CalendarSnapshotResponse): CalendarSnapshot {
    const courts = (response.pistas ?? []).map((court, index) => this.mapCalendarCourt(court, index));

    return {
      summary: this.mapCalendarSummary(response.resumen),
      courts,
      reservations: (response.reservas ?? []).map(item => this.mapCalendarReservation(item)),
    };
  }

  private mapCalendarSummary(response: CalendarSummaryResponse | undefined): CalendarSummary {
    return {
      occupancyPercentage: this.clampPercentage(response?.ocupacionHoy),
      fixedReservations: this.toNumber(response?.reservasFijas),
      activeCourts: this.toNumber(response?.pistasActivas),
      estimatedRevenue: this.toNumber(response?.ingresosEstimados),
    };
  }

  private mapCalendarCourt(response: CalendarCourtResponse, index: number): CalendarCourt {
    return {
      id: this.toNumber(response.id, index + 1),
      name: this.toText(response.nombre, `Pista ${index + 1}`),
      label: this.toText(response.etiqueta, `Pista ${index + 1}`),
      status: this.mapCourtStatus(response.estado),
    };
  }

  private mapCalendarReservation(response: CalendarReservationResponse): CalendarReservation {
    return {
      id: String(response.id ?? crypto.randomUUID()),
      courtId: this.toNumber(response.pistaId),
      title: this.toText(response.titulo, 'Reserva'),
      type: this.mapReservationType(response.tipo),
      startTime: this.toText(response.horaInicio, '08:00'),
      endTime: this.toText(response.horaFin, '09:00'),
      icon: this.toNullableText(response.icono),
    };
  }

  private mapCalendarReservationsToUpcoming(snapshot: CalendarSnapshot, dateIso: string): UpcomingReservation[] {
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

  private mapCourtStatus(value: unknown): CourtStatus {
    const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

    switch (normalized) {
      case 'DISPONIBLE':
      case 'AVAILABLE':
        return 'AVAILABLE';
      case 'EN_JUEGO':
      case 'IN_PLAY':
        return 'IN_PLAY';
      case 'MANTENIMIENTO':
      case 'MAINTENANCE':
        return 'MAINTENANCE';
      default:
        return 'UNKNOWN';
    }
  }

  private mapReservationType(value: unknown): ReservationType {
    const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';
    return normalized === 'FIXED' || normalized === 'FIJA' ? 'FIXED' : 'PUNCTUAL';
  }

  private clampPercentage(value: unknown): number {
    const numericValue = this.toNumber(value);
    return Math.max(0, Math.min(100, numericValue));
  }

  private toNumber(value: unknown, fallback = 0): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private toNullableNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private toText(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private toNullableText(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }
}
