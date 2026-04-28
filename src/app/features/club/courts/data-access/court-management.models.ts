import { BackendResult, CourtStatus } from '@app/features/club/shared/club.models';

export type { CourtStatus };

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

export type CourtManagementResult<T> = BackendResult<T>;
