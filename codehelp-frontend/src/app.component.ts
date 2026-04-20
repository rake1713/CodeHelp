import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './app/components/navbar/navbar.component';
import { AuthService } from './app/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const restore$ = this.authService.tryRestoreSession();

    if (restore$) {
      restore$.subscribe({
        next: () => {
          console.log('Session restored');
        },
        error: () => {
          this.authService.logout();
        }
      });
    }
  }
}