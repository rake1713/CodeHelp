import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  runCode(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}run-code/`, data);
  }

  createSubmission(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}submissions/`, data);
  }

  getMySubmissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}submissions/`);
  }

  getLastSubmission(problemId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}problems/${problemId}/last-submission/`);
  }
}
