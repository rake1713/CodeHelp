import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ProblemService } from '../../services/problem.service';
import { SubmissionService } from '../../services/submission.service';

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './my-submissions.component.html',
  styleUrl: './my-submissions.component.css'
})
export class MySubmissionsComponent implements OnInit {
  user: any = null;
  stats: any = null;
  submissions: any[] = [];

  loading = true;
  expandedSubmissionId: number | null = null;

  constructor(
    public authService: AuthService,
    private problemService: ProblemService,
    private submissionService: SubmissionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    forkJoin({
      user: this.authService.getProfile(),
      stats: this.problemService.getMyStats(),
      submissions: this.submissionService.getMySubmissions(),
    }).subscribe({
      next: ({ user, stats, submissions }) => {
        this.user = user;
        this.stats = stats;
        this.submissions = submissions.results || submissions;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleSubmission(id: number): void {
    this.expandedSubmissionId = this.expandedSubmissionId === id ? null : id;
    this.cdr.detectChanges();
  }
}
