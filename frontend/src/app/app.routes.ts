import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { authGuardGuard } from './shared/guards/auth-guard.guard';

export const routes: Routes = [
  {
    path: 'chat/:id',
    component: HomeComponent,
    canActivate: [authGuardGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'chat/:id', pathMatch: 'full' },
  { path: '**', redirectTo: 'chat/:id', pathMatch: 'full' },
];
