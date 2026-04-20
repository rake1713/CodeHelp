import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  searchQuery: string = '';

  constructor(private router: Router) {}

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Перенаправляем на Problems и передаем параметр поиска в URL
      this.router.navigate(['/problems'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  exploreLanguage(lang: string): void {
    // Перенаправляем на Problems и сразу включаем фильтр по категории
    this.router.navigate(['/problems'], { queryParams: { category: lang } });
  }
}