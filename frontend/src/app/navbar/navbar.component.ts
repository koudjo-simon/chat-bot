import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../shared/navigation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  username: string | undefined;
  constructor(private navigationService: NavigationService) {}

  ngOnInit(): void {
    this.username = this.getName();
  }

  getName() {
    return JSON.parse(sessionStorage.getItem('loggedinUser') || '{}').name;
  }

  toggleSidebar(): void {
    const currentState = this.navigationService.getCurrentSidebarState();
    this.navigationService.setCurrentSidebarState(!currentState);
  }
}
