import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProblemService } from '../../services/problem.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-problems',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './problems.component.html',
  styleUrl: './problems.component.css'
})
export class ProblemsComponent implements OnInit {
  problems: any[] = [];
  filteredProblems: any[] = [];

  loading = false;
  errorMessage = '';

  selectedDifficulty = '';
  selectedCategory = '';
  searchText = '';

  categories: string[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private problemService: ProblemService,
    private route: ActivatedRoute
    
  ) {}

  ngOnInit(): void {
    this.loadProblems();
    this.loadCategories();

    // Слушаем параметры из URL (с главной страницы)
    this.route.queryParams.subscribe(params => {
      let shouldFilter = false;
      
      if (params['q']) {
        this.searchText = params['q'];
        shouldFilter = true;
      }
      
      if (params['category']) {
        this.selectedCategory = params['category'];
        shouldFilter = true;
      }

      if (shouldFilter) {
        // Даем Angular миллисекунду на загрузку данных, затем фильтруем
        setTimeout(() => this.applyFilters(), 100);
      }
    });
  }
  loadCategories(): void {
    this.problemService.getCategories().subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : (data.results || []);
        this.categories = list.map((c: any) => c.name);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Categories load error:', err)
    });
  }

  loadProblems(): void {
    this.loading = true;
    this.errorMessage = '';

    this.problemService.getProblems().subscribe({
      next: (data: any) => {
        this.problems = Array.isArray(data) ? data : (data.results || []);
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('PROBLEMS LOAD ERROR:', err);
        this.errorMessage = 'Failed to load tasks';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setDifficulty(difficulty: string): void {
    this.selectedDifficulty = difficulty;
    this.applyFilters();
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchText.trim().toLowerCase();

    this.filteredProblems = this.problems.filter((problem) => {
      const matchesDifficulty =
        !this.selectedDifficulty ||
        problem.difficulty === this.selectedDifficulty;

      const matchesCategory =
        !this.selectedCategory ||
        problem.category_name === this.selectedCategory;

      const matchesSearch =
        !query ||
        problem.title.toLowerCase().includes(query) ||
        (problem.description ?? '').toLowerCase().includes(query);

      return matchesDifficulty && matchesCategory && matchesSearch;
    });

    this.cdr.detectChanges();
  }
}