import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const access = localStorage.getItem('access');
  const http = inject(HttpClient);

  const isAuthRequest =
    req.url.includes('/api/login/') || req.url.includes('/api/register/');

  const authReq = access && !isAuthRequest
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${access}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isRefreshRequest = req.url.includes('/api/login/refresh/');

      if (error.status === 401 && !isAuthRequest && !isRefreshRequest) {
        const refresh = localStorage.getItem('refresh');

        if (!refresh) {
          return throwError(() => error);
        }

        return http.post<any>('http://127.0.0.1:8000/api/login/refresh/', {
          refresh: refresh
        }).pipe(
          switchMap((res) => {
            localStorage.setItem('access', res.access);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.access}`
              }
            });

            return next(retryReq);
          }),
          catchError((refreshError) => {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};