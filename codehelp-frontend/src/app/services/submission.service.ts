import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private base = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  createSubmission(data: { problem: number; code: string; language: string }): Observable<any> {
    return this.http.post(`${this.base}/submissions/`, data);
  }

  getMySubmissions(): Observable<any> {
    return this.http.get(`${this.base}/submissions/`);
  }

  runCode(data: { code: string; language: string; stdin: string }): Observable<any> {
    return this.http.post(`${this.base}/run/`, data);
  }
}