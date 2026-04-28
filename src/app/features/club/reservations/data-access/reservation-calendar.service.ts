import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ClubApiBase } from '@app/features/club/shared/data-access/club-api.base';
import { clampPercentage, mapCourtStatus, toNullableText, toNumber, toText } from '@app/features/club/shared/data-access/club-api-mapper.utils';
import { normalizeText } from '@app/shared/utils/text.utils';
import {
  ReservationCalendarCourt,
  ReservationCalendarItem,
  ReservationCalendarResult,
  ReservationCalendarSnapshot,
  ReservationCalendarSummary,
  ReservationType,
} from './reservation-calendar.models';

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
export class ReservationCalendarService extends ClubApiBase {
  getSnapshot(dateIso: string): Observable<ReservationCalendarResult<ReservationCalendarSnapshot>> {
    return this.http
      .get<CalendarSnapshotResponse>(`${this.apiBaseUrl}/reservas/calendario`, {
        headers: this.createHeaders(),
        params: { fecha: dateIso },
      })
      .pipe(
        map(response => ({
          data: this.mapSnapshot(response),
          isFallback: false,
        })),
        catchError(() =>
          of({
            data: this.emptySnapshot(),
            isFallback: true,
          })
        )
      );
  }

  emptySnapshot(): ReservationCalendarSnapshot {
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

  private mapSnapshot(response: CalendarSnapshotResponse): ReservationCalendarSnapshot {
    return {
      summary: this.mapSummary(response.resumen),
      courts: (response.pistas ?? []).map((court, index) => this.mapCourt(court, index)),
      reservations: (response.reservas ?? []).map(item => this.mapReservation(item)),
    };
  }

  private mapSummary(response: CalendarSummaryResponse | undefined): ReservationCalendarSummary {
    return {
      occupancyPercentage: clampPercentage(response?.ocupacionHoy),
      fixedReservations: toNumber(response?.reservasFijas),
      activeCourts: toNumber(response?.pistasActivas),
      estimatedRevenue: toNumber(response?.ingresosEstimados),
    };
  }

  private mapCourt(response: CalendarCourtResponse, index: number): ReservationCalendarCourt {
    return {
      id: toNumber(response.id, index + 1),
      name: toText(response.nombre, `Pista ${index + 1}`),
      label: toText(response.etiqueta, `Pista ${index + 1}`),
      status: mapCourtStatus(response.estado),
    };
  }

  private mapReservation(response: CalendarReservationResponse): ReservationCalendarItem {
    return {
      id: String(response.id ?? crypto.randomUUID()),
      courtId: toNumber(response.pistaId),
      title: toText(response.titulo, 'Reserva'),
      type: this.mapReservationType(response.tipo),
      startTime: toText(response.horaInicio, '08:00'),
      endTime: toText(response.horaFin, '09:00'),
      icon: toNullableText(response.icono),
    };
  }

  private mapReservationType(value: unknown): ReservationType {
    const normalized = typeof value === 'string' ? normalizeText(value).toUpperCase() : '';
    return normalized === 'FIXED' || normalized === 'FIJA' ? 'FIXED' : 'PUNCTUAL';
  }
}
