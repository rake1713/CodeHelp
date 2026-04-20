import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ==========================================
  // НОВЫЕ МЕТОДЫ (Исправленные)
  // ==========================================
  
  getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/`, { headers: this.getAuthHeaders() });
  }

  updateProfile(data: { first_name: string; last_name: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/`, data, { headers: this.getAuthHeaders() });
  }

  // ==========================================
  // СТАРЫЕ МЕТОДЫ (Остаются без изменений)
  // ==========================================

  tryRestoreSession(): Observable<any> | null {
    const access = this.getAccessToken();
    const refresh = this.getRefreshToken();

    if (access) {
      return null;
    }

    if (refresh) {
      return this.refreshToken();
    }

    return null;
  }

  // Логин
  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login/`, data).pipe(
      tap((res) => {
        if (this.isBrowser && res.access && res.refresh) {
          localStorage.setItem('access', res.access);
          localStorage.setItem('refresh', res.refresh);
          localStorage.setItem('username', data.username);
        }
      })
    );
  }

  // Регистрация
  register(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/`, data);
  }

  // Обновление токена
  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();

    return this.http.post<any>(`${this.apiUrl}/login/refresh/`, { refresh }).pipe(
      tap((res) => {
        if (this.isBrowser && res.access) {
          localStorage.setItem('access', res.access);
        }

        if (this.isBrowser && res.refresh) {
          localStorage.setItem('refresh', res.refresh);
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('username');
    }
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return this.isBrowser ? localStorage.getItem('access') : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem('refresh') : null;
  }

  getUsername(): string {
    return this.isBrowser ? (localStorage.getItem('username') || '') : '';
  }
}