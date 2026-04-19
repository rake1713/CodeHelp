import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const access = authService.getAccessToken();

  // Игнорируем запросы на авторизацию, чтобы не прикреплять туда токен
  const isAuthRequest = req.url.includes('/login/') || 
                        req.url.includes('/register/') || 
                        req.url.includes('/token/refresh/');

  let authReq = req;
  
  // Добавляем заголовок Bearer
  if (access && !isAuthRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${access}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Если поймали 401 ошибку и это не попытка залогиниться
      if (error.status === 401 && !isAuthRequest) {
        const refresh = authService.getRefreshToken();

        // Если рефреш-токена нет, просто выкидываем пользователя
        if (!refresh) {
          authService.logout();
          return throwError(() => error);
        }

        // Пытаемся обновить токен
        return authService.refreshToken().pipe(
          switchMap((res) => {
            // Если успешно - повторяем оригинальный запрос с новым токеном
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.access}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Если даже рефреш-токен протух - разлогиниваем юзера
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // Для остальных ошибок просто пробрасываем их дальше
      return throwError(() => error);
    })
  );
};