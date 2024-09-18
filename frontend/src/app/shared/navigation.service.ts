import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private currentSidebarStateSubject = new BehaviorSubject<boolean>(false);
  currentSidebarState$ = this.currentSidebarStateSubject.asObservable();

  constructor(private router: Router) {}

  setCurrentSidebarState(state: boolean): void {
    this.currentSidebarStateSubject.next(state);
  }

  getCurrentSidebarState(): boolean {
    return this.currentSidebarStateSubject.getValue();
  }

  isAuthenticated() {
    return (
      JSON.parse(sessionStorage.getItem('loggedinUser') || '{}').email !=
      undefined
    );
  }

  logout() {
    sessionStorage.removeItem('loggedinUser');
    window.location.href = '/login';
  }
}
