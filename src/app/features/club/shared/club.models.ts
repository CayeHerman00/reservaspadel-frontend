export type CourtStatus = 'AVAILABLE' | 'IN_PLAY' | 'MAINTENANCE' | 'UNKNOWN';

export interface BackendResult<T> {
  data: T;
  isFallback: boolean;
}
