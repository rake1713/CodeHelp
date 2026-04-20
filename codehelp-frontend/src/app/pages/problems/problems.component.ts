import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProblemService } from '../../services/problem.service';

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

  categories: string[] = [
    'Algorithms',
    'Array',
    'Basics',
    'Conditions',
    'Loops',
    'Arrays',
    'Strings',
    'Functions',
    'Recursion',
    'Sorting',
    'Data Structures',
    'Geometry'
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private problemService: ProblemService
  ) {}

  ngOnInit(): void {
    this.loadProblems();
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
  }
}