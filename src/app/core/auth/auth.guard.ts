import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { APP_ROUTES } from '@app/shared/navigation/app-navigation';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getCurrentSession()) {
    return true;
  }

  return router.createUrlTree([APP_ROUTES.login]);
};
