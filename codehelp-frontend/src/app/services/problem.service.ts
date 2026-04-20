import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProblemService {
  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  getProblems(): Observable<any> {
    return this.http.get(`${this.apiUrl}problems/`);
  }

  getProblem(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}problems/${id}/`);
  }

  getMyStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}my_stats/`, { headers: this.getAuthHeaders() });
  }
}