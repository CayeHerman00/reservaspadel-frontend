import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  tipo: string;
  email: string;
  rol: string;
  nombre: string;
}

interface RegisterResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  fechaCreacion: string;
}

export interface AuthSession {
  token: string;
  tokenType: string;
  email: string;
  role: string;
  name: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface RegisteredUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly storageKey = 'reservas-padel.auth-session';

  readonly session = signal<AuthSession | null>(this.loadStoredSession());

  login(username: string, password: string): Observable<AuthSession> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map(response => ({
          token: response.token,
          tokenType: response.tipo,
          email: response.email,
          role: response.rol,
          name: response.nombre,
        })),
        tap(session => this.persistSession(session))
      );
  }

  register(payload: RegisterPayload): Observable<RegisteredUser> {
    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/register`, {
        username: payload.username,
        email: payload.email,
        password: payload.password,
      })
      .pipe(
        map(response => ({
          id: response.id,
          name: response.nombre,
          email: response.email,
          role: response.rol,
          createdAt: response.fechaCreacion,
        }))
      );
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(this.storageKey);
  }

  getCurrentSession(): AuthSession | null {
    return this.session();
  }

  getDisplayRole(role: string): string {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'Administrador';
      case 'USER':
        return 'Usuario';
      default:
        return role;
    }
  }

  private persistSession(session: AuthSession): void {
    this.session.set(session);
    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  private loadStoredSession(): AuthSession | null {
    try {
      const rawSession = localStorage.getItem(this.storageKey);
      if (!rawSession) {
        return null;
      }

      const session = JSON.parse(rawSession) as Partial<AuthSession>;
      if (!session.token || !session.tokenType || !session.email || !session.role || !session.name) {
        localStorage.removeItem(this.storageKey);
        return null;
      }

      return {
        token: session.token,
        tokenType: session.tokenType,
        email: session.email,
        role: session.role,
        name: session.name,
      };
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
