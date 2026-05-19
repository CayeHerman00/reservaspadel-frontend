import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface WaitlistCountResponse {
  count: number;
}

interface WaitlistSubscribeResponse {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/waitlist';

  getCount(): Observable<number> {
    return this.http
      .get<WaitlistCountResponse>(`${this.apiUrl}/count`)
      .pipe(map(response => response.count));
  }

  subscribe(email: string): Observable<WaitlistSubscribeResponse> {
    return this.http.post<WaitlistSubscribeResponse>(`${this.apiUrl}/subscribe`, { email });
  }
}
