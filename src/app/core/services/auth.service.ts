import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, AuthUser } from '../../shared/models/auth.model';

const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly _token = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));
  private readonly _currentUser = signal<AuthUser | null>(null);

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  constructor() {
    this.restoreUserFromToken();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        map(res => res.data),
        tap(data => {
          sessionStorage.setItem(TOKEN_KEY, data.access_token);
          this._token.set(data.access_token);
          this._currentUser.set(data.user);
        })
      );
  }

  changePassword(current_password: string, new_password: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/users/me/password`, {
      current_password,
      new_password,
    });
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this._currentUser.set(null);
  }

  updatePhoto(photo_url: string | null): void {
    const user = this._currentUser();
    if (user) this._currentUser.set({ ...user, photo_url });
  }

  private restoreUserFromToken(): void {
    const token = this._token();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this._currentUser.set({
        user_id:   payload.sub,
        email:     payload.email,
        full_name: payload.name,
        role:      payload.role,
        photo_url: payload.photo_url ?? null,
      });
    } catch {
      this.logout();
    }
  }
}
