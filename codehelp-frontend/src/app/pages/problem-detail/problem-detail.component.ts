import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProblemService } from '../../services/problem.service';
import { SubmissionService } from '../../services/submission.service';
@Component({
  selector: 'app-problem-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './problem-detail.component.html',
  styleUrl: './problem-detail.component.css'
})
export class ProblemDetailComponent implements OnInit {
  loading = false;
  errorMessage = '';
  problem: any = null;

  isBrowser = false;
  selectedLanguage = 'python';
  code = '';
  outputText = 'Нажми «Отправить», чтобы проверить решение';
  submitting = false;

  constructor(
    private submissionService: SubmissionService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public authService: AuthService,
    private problemService: ProblemService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    this.problemService.getProblem(id).subscribe({
      next: (data) => {
        this.problem = data;
        this.setDefaultCode();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Не удалось загрузить задачу';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private getStarterCode(language: string): string {
    if (language === 'python') {
      return `import sys
input = sys.stdin.readline

def solve():
    pass

solve()
`;
    }

    if (language === 'cpp') {
      return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    return 0;
}
`;
    }

    return `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {

    }
}
`;
  }

  setDefaultCode(): void {
    this.code = this.getStarterCode(this.selectedLanguage);
  }

  onLanguageChange(): void {
    this.setDefaultCode();
  }

  resetCode(): void {
    this.setDefaultCode();
  }

  submitCode(): void {
    if (!this.problem) return;

    this.submitting = true;
    this.outputText = 'Проверка решения...';

    this.submissionService.createSubmission({
      problem: this.problem.id,
      code: this.code,
      language: this.selectedLanguage
    }).subscribe({
      next: (data) => {
        this.outputText = `Статус: ${data.status}\n\n${data.status_details || ''}`;
        this.submitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('SUBMISSION ERROR:', err);

        if (err.status === 401) {
          this.outputText = 'Сначала войди в аккаунт заново';
        } else {
          this.outputText = 'Не удалось отправить решение';
        }

        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}