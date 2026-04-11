import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private submissionsUrl = 'http://127.0.0.1:8000/api/submissions/';

  constructor(private http: HttpClient) {}

  createSubmission(data: {
    problem: number;
    code: string;
    language: string;
  }): Observable<any> {
    return this.http.post(this.submissionsUrl, data);
  }

  getMySubmissions(): Observable<any> {
    return this.http.get(this.submissionsUrl);
  }
}