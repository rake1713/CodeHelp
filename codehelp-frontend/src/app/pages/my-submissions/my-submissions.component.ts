import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubmissionService } from '../../services/submission.service';

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-submissions.component.html',
  styleUrl: './my-submissions.component.css'
})
export class MySubmissionsComponent implements OnInit {
  submissions: any[] = [];
  loading = true;
  errorMessage = '';
  isBrowser = false;

  constructor(
    private submissionService: SubmissionService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      this.loading = false;
      return;
    }

    this.loadMySubmissions();
  }

  loadMySubmissions(): void {
    this.submissionService.getMySubmissions().subscribe({
      next: (data: any) => {
        this.submissions = Array.isArray(data) ? data : (data.results || []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('MY SUBMISSIONS ERROR:', err);
        this.errorMessage = 'Не удалось загрузить мои отправки';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    if (status === 'Accepted') return 'accepted';
    if (status === 'Wrong Answer') return 'wrong';
    if (status === 'Runtime Error') return 'runtime';
    if (status === 'Time Limit Exceeded') return 'tle';
    return 'other';
  }
}