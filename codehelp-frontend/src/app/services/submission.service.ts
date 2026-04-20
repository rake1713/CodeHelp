import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  // Убедись, что адрес бэкенда правильный (обычно это 8000 порт)
  private apiUrl = 'http://127.0.0.1:8000/api/'; 

  constructor(private http: HttpClient) {}

  // Вспомогательная функция для добавления токена
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  runCode(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}run-code/`, data, { headers: this.getAuthHeaders() });
  }

  createSubmission(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}submissions/`, data, { headers: this.getAuthHeaders() });
  }

  getMySubmissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}submissions/`, { headers: this.getAuthHeaders() });
  }

  getLastSubmission(problemId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}problems/${problemId}/last-submission/`, { headers: this.getAuthHeaders() });
  }
}