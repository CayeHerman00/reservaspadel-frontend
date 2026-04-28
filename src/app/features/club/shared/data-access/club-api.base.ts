import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/core/auth/auth.service';

export abstract class ClubApiBase {
  protected readonly http = inject(HttpClient);
  protected readonly authService = inject(AuthService);
  protected readonly apiBaseUrl = 'http://localhost:8080/api';

  protected createHeaders(): HttpHeaders {
    const session = this.authService.getCurrentSession();
    if (!session) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `${session.tokenType} ${session.token}`,
    });
  }
}
