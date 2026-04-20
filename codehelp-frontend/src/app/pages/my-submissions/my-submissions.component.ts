import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
    let userLoaded = false, statsLoaded = false, subsLoaded = false;

    const checkLoading = () => {
      if (userLoaded && statsLoaded && subsLoaded) {
        this.loading = false;
        this.cdr.detectChanges();
      }
    };

    // 1. Профиль
    this.authService.getProfile().subscribe({
      next: (userData: any) => {
        this.user = userData;
        userLoaded = true; checkLoading();
      },
      error: (err: any) => { userLoaded = true; checkLoading(); }
    });

    // 2. Статистика
    this.problemService.getMyStats().subscribe({
      next: (statsData: any) => {
        this.stats = statsData;
        statsLoaded = true; checkLoading();
      },
      error: (err: any) => { statsLoaded = true; checkLoading(); }
    });

    // 3. Решения
    this.submissionService.getMySubmissions().subscribe({
      next: (subData: any) => {
        this.submissions = subData.results || subData;
        subsLoaded = true; checkLoading();
      },
      error: (err: any) => { subsLoaded = true; checkLoading(); }
    });
  }

// --- ЛОГИКА РЕШЕНИЙ ---
  toggleSubmission(id: number): void {
    this.expandedSubmissionId = this.expandedSubmissionId === id ? null : id;
    
    // ЭТА СТРОЧКА ЗАСТАВИТ ЭКРАН ОБНОВЛЯТЬСЯ МГНОВЕННО:
    this.cdr.detectChanges(); 
  }
}