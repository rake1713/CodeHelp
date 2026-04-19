import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'http://127.0.0.1:8000/api/login/';
  private refreshUrl = 'http://127.0.0.1:8000/api/token/refresh/';
  private registerUrl = 'http://127.0.0.1:8000/api/register/';

  constructor(private http: HttpClient) {}

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(this.loginUrl, data).pipe(
      tap((res) => {
        localStorage.setItem('access', res.access);
        localStorage.setItem('refresh', res.refresh);
        localStorage.setItem('username', data.username);
      })
    );
  }

  register(data: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(this.registerUrl, data);
  }

  refreshToken(): Observable<any> {
    const refresh = localStorage.getItem('refresh');

    return this.http.post<any>(this.refreshUrl, { refresh }).pipe(
      tap((res) => {
        localStorage.setItem('access', res.access);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh');
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }
}