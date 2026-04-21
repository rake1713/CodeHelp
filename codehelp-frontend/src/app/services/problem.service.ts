import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProblemService {
  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  getProblems(): Observable<any> {
    return this.http.get(`${this.apiUrl}problems/`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}categories/`);
  }

  getProblem(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}problems/${id}/`);
  }

  getMyStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}stats/`);
  }
}
