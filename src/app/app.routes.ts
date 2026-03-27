import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { RegistroInteresados } from './pages/registro-interesados/registro-interesados';
import { Dashboard } from './pages/dashboard/dashboard';
import { Calendario } from './pages/calendar/calendario';
import { MisPistas } from './pages/mis-pistas/mis-pistas';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { authGuard } from './shared/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'waitlist', component: RegistroInteresados },
  { path: 'login', component: Login },
  { path: 'register', component: Registro },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'calendar', component: Calendario, canActivate: [authGuard] },
  { path: 'courts', component: MisPistas, canActivate: [authGuard] },
];
