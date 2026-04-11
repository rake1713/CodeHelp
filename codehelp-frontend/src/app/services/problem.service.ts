import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProblemService {
  private problemsUrl = 'http://127.0.0.1:8000/api/problems/';

  constructor(private http: HttpClient) {}

  getProblems(): Observable<any> {
    return this.http.get(this.problemsUrl);
  }

  getProblem(id: number): Observable<any> {
    return this.http.get(`${this.problemsUrl}${id}/`);
  }
}