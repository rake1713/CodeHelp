import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubmissionService } from '../../services/submission.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-submissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-submissions.component.html',
  styleUrls: ['./my-submissions.component.css']
})
export class MySubmissionsComponent implements OnInit {
  submissions: any[] = [];
  loading = true;
  errorMessage = '';
  isBrowser = false;

  constructor(
    private submissionService: SubmissionService,
    public authService: AuthService,
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

  // 👇 Вот этот блок обязательно должен быть ЗДЕСЬ, внутри класса!
  get avatarLetter(): string {
    const name = this.authService.getUsername();
    return name ? name.charAt(0).toUpperCase() : 'U';
  }
  // 👆 

  loadMySubmissions(): void {
    this.submissionService.getMySubmissions().subscribe({
      next: (data: any) => {
        this.submissions = Array.isArray(data) ? data : (data.results || []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load your submissions.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    const s = status?.toLowerCase() || '';
    if (s.includes('accepted')) return 'success';
    if (s.includes('wrong') || s.includes('error')) return 'error';
    return 'warning';
  }
}