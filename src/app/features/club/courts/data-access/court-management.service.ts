import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ClubApiBase } from '@app/features/club/shared/data-access/club-api.base';
import { mapCourtStatus, toNullableText, toNumber, toText } from '@app/features/club/shared/data-access/club-api-mapper.utils';
import { Court, CourtManagementResult, CreateCourtPayload } from './court-management.models';

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

@Injectable({ providedIn: 'root' })
export class CourtManagementService extends ClubApiBase {
  getCourts(): Observable<CourtManagementResult<Court[]>> {
    return this.http
      .get<CourtCollectionResponse>(`${this.apiBaseUrl}/pistas`, { headers: this.createHeaders() })
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
        `${this.apiBaseUrl}/pistas`,
        {
          nombre: payload.name,
          superficie: payload.surface,
          extras: payload.features,
        },
        { headers: this.createHeaders() }
      )
      .pipe(map(response => this.mapCourt(response, 0)));
  }

  private mapCourt(response: CourtResponse | CreateCourtResponse, index: number): Court {
    return {
      id: toNumber(response.id, index + 1),
      name: toText(response.nombre, `Pista ${index + 1}`),
      details: toNullableText(response.descripcion),
      status: mapCourtStatus(response.estado),
    };
  }
}
