import { Routes } from '@angular/router';
import { Landing } from './pages/landing';
import { Calendario } from './pages/calendario';
import { Dashboard } from './pages/dashboard';
import { Configurador } from './pages/configurador';
import { Servicios } from './pages/servicios';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'calendario', component: Calendario },
  { path: 'dashboard', component: Dashboard },
  { path: 'configurador', component: Configurador },
  { path: 'servicios', component: Servicios },
];
