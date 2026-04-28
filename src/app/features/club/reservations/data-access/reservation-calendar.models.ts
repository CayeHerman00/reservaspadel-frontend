import { BackendResult, CourtStatus } from '@app/features/club/shared/club.models';

export type ReservationType = 'PUNCTUAL' | 'FIXED';

export interface ReservationCalendarSummary {
  occupancyPercentage: number;
  fixedReservations: number;
  activeCourts: number;
  estimatedRevenue: number;
}

export interface ReservationCalendarCourt {
  id: number;
  name: string;
  label: string;
  status: CourtStatus;
}

export interface ReservationCalendarItem {
  id: string;
  courtId: number;
  title: string;
  type: ReservationType;
  startTime: string;
  endTime: string;
  icon: string | null;
}

export interface ReservationCalendarSnapshot {
  summary: ReservationCalendarSummary;
  courts: ReservationCalendarCourt[];
  reservations: ReservationCalendarItem[];
}

export type ReservationCalendarResult<T> = BackendResult<T>;
