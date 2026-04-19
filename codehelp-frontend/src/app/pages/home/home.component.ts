import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // Получаем доступ к HTML-элементу input
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Слушаем нажатия клавиш на всей странице
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Проверяем: нажата ли кнопка Ctrl (или Cmd на Mac) И кнопка 'k'
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault(); // Блокируем стандартное поведение браузера (чтобы он не открывал свою строку поиска)
      this.searchInput.nativeElement.focus(); // Ставим курсор в наш инпут
    }
  }
}