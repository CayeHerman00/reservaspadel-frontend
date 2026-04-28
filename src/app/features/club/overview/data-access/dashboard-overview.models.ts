import { BackendResult } from '@app/features/club/shared/club.models';

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

export type DashboardOverviewResult<T> = BackendResult<T>;
