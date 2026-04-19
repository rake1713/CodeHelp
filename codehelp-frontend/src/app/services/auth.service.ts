import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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

  // Регистрация (Можешь добавить email сюда, если нужно)
  // Было: register(data: any): Observable<any>
  // Стало:
  register(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/`, data);
  }

  // Обновление токена
  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    
    // ВАЖНО: Если бэкенд использует другой URL для рефреша (например /login/refresh/), 
    // поменяй 'token/refresh/' на нужный.
    return this.http.post<any>(`${this.apiUrl}/token/refresh/`, { refresh }).pipe(
      tap((res) => {
        if (this.isBrowser && res.access) {
          localStorage.setItem('access', res.access);
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