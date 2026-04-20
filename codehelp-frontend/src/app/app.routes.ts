import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ProblemsComponent } from './pages/problems/problems.component';
import { ProblemDetailComponent } from './pages/problem-detail/problem-detail.component';
import { ForumComponent } from './pages/forum/forum.component';
import { RegisterComponent } from './pages/register/register.component';
import { MySubmissionsComponent } from './pages/my-submissions/my-submissions.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'problems', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'problems', component: ProblemsComponent },
  { path: 'problems/:id', component: ProblemDetailComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'my-submissions', component: MySubmissionsComponent, canActivate: [authGuard] },
];