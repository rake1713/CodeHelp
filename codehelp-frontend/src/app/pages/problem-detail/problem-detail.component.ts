import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
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

declare const require: any;

@Component({
  selector: 'app-problem-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './problem-detail.component.html',
  styleUrl: './problem-detail.component.css'
})
export class ProblemDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorContainer') editorContainer!: ElementRef<HTMLDivElement>;

  loading = false;
  errorMessage = '';
  problem: any = null;

  isBrowser = false;
  selectedLanguage = 'python';
  code = '';
  outputText = '';
  submitting = false;
  running = false;
  customInput = '';
  showInput = false;
  consoleHeight = 220;

  toggleInput(): void {
    this.showInput = !this.showInput;
    this.consoleHeight = this.showInput ? 340 : 220;
    this.cdr.detectChanges();
  }

  private monacoEditor: any = null;
  private problemLoaded = false;

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
        this.code = this.getStarterCode(this.selectedLanguage);
        this.loading = false;
        this.problemLoaded = true;
        this.cdr.detectChanges();
        this.initMonaco();
      },
      error: () => {
        this.errorMessage = 'Failed to load task';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.problemLoaded) this.initMonaco();
  }

  private initMonaco(): void {
    if (!this.isBrowser || this.monacoEditor || !this.editorContainer?.nativeElement) return;

    const win = window as any;

    const createEditor = () => {
      win.require.config({ paths: { vs: '/assets/monaco/vs' } });
      win.require(['vs/editor/editor.main'], () => {
        const container = this.editorContainer.nativeElement;
        this.monacoEditor = win.monaco.editor.create(container, {
          value: this.code,
          language: this.selectedLanguage === 'cpp' ? 'cpp' : this.selectedLanguage,
          theme: 'vs-dark',
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          tabSize: 4,
          insertSpaces: true,
          automaticLayout: true,
          wordWrap: 'off',
          padding: { top: 12, bottom: 12 },
          scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
        });

        this.monacoEditor.onDidChangeModelContent(() => {
          this.code = this.monacoEditor.getValue();
        });
      });
    };

    if (win.require) {
      createEditor();
    } else {
      const script = document.createElement('script');
      script.src = '/assets/monaco/vs/loader.js';
      script.onload = createEditor;
      document.head.appendChild(script);
    }
  }

  private getStarterCode(language: string): string {
    if (language === 'python') {
      return `import sys\ninput = sys.stdin.readline\n\ndef solve():\n    pass\n\nsolve()\n`;
    }
    if (language === 'cpp') {
      return `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    return 0;\n}\n`;
    }
    return `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n\n    }\n}\n`;
  }

  onLanguageChange(): void {
    this.code = this.getStarterCode(this.selectedLanguage);
    if (this.monacoEditor) {
      const win = window as any;
      const langMap: Record<string, string> = { python: 'python', cpp: 'cpp', java: 'java' };
      win.monaco.editor.setModelLanguage(this.monacoEditor.getModel(), langMap[this.selectedLanguage] || 'plaintext');
      this.monacoEditor.setValue(this.code);
    }
  }

  resetCode(): void {
    this.code = this.getStarterCode(this.selectedLanguage);
    if (this.monacoEditor) this.monacoEditor.setValue(this.code);
  }

  runCode(): void {
    if (this.monacoEditor) this.code = this.monacoEditor.getValue();
    if (!this.code.trim()) return;

    this.running = true;
    this.outputText = '▶ Запуск...';

    this.submissionService.runCode({
      code: this.code,
      language: this.selectedLanguage,
      stdin: this.customInput
    }).subscribe({
      next: (data) => {
        this.outputText = data.output || 'Нет вывода';
        this.running = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.outputText = err.status === 401 ? 'Войдите в аккаунт чтобы запускать код' : 'Ошибка сервера';
        this.running = false;
        this.cdr.detectChanges();
      }
    });
  }

  startResize(event: MouseEvent): void {
    event.preventDefault();
    const startY = event.clientY;
    const startH = this.consoleHeight;

    const onMove = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      this.consoleHeight = Math.min(600, Math.max(80, startH + delta));
      this.cdr.detectChanges();
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  submitCode(): void {
    if (!this.problem) return;
    if (this.monacoEditor) this.code = this.monacoEditor.getValue();

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
        if (err.status === 401) {
          this.outputText = 'First, log in to your account again.';
        } else {
          this.outputText = 'Failed to submit solution';
        }
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.monacoEditor) {
      this.monacoEditor.dispose();
      this.monacoEditor = null;
    }
  }
}