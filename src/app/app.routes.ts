import { Routes } from '@angular/router';
import { authGuard } from '@app/core/auth/auth.guard';
import { LoginPage } from '@app/features/access/login/login';
import { RegisterPage } from '@app/features/access/register/register';
import { ConfiguratorPage } from '@app/features/club/configurator/configurator';
import { CourtsPage } from '@app/features/club/courts/courts';
import { DashboardPage } from '@app/features/club/overview/dashboard';
import { ReservationCalendarPage } from '@app/features/club/reservations/reservation-calendar';
import { LandingPage } from '@app/features/marketing/landing/landing';
import { PricingPage } from '@app/features/marketing/pricing/pricing';
import { TermsPage } from '@app/features/marketing/terms/terms';
import { WaitlistPage } from '@app/features/marketing/waitlist/waitlist';
import { APP_ROUTE_SEGMENTS } from '@app/shared/navigation/app-navigation';

export const routes: Routes = [
  { path: APP_ROUTE_SEGMENTS.home, component: LandingPage },
  { path: APP_ROUTE_SEGMENTS.waitlist, component: WaitlistPage },
  { path: APP_ROUTE_SEGMENTS.pricing, component: PricingPage },
  { path: APP_ROUTE_SEGMENTS.terms, component: TermsPage },
  { path: APP_ROUTE_SEGMENTS.login, component: LoginPage },
  { path: APP_ROUTE_SEGMENTS.register, component: RegisterPage },
  { path: APP_ROUTE_SEGMENTS.dashboard, component: DashboardPage, canActivate: [authGuard] },
  { path: APP_ROUTE_SEGMENTS.calendar, component: ReservationCalendarPage, canActivate: [authGuard] },
  { path: APP_ROUTE_SEGMENTS.courts, component: CourtsPage, canActivate: [authGuard] },
  { path: APP_ROUTE_SEGMENTS.configurator, component: ConfiguratorPage, canActivate: [authGuard] },
];
