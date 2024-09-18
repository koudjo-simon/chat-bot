import { Component, OnInit, signal } from '@angular/core';
import { NavigationService } from '../shared/navigation.service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { ChatComponent } from '../chat/chat.component';
import { ChatFooterComponent } from '../chat-footer/chat-footer.component';
import { ChatService } from '../shared/services/chat.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    ChatComponent,
    ChatFooterComponent,
  ],

  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  sidebarState = signal(false);
  activeRoute = signal('/chat');
  chats: any[] = [];
  activeChat: any;
  activeChatId: any;

  constructor(
    private navigationService: NavigationService,
    private chatService: ChatService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadChats();
    this.route.params.subscribe((params) => {
      this.activeChatId = +params['id'];
    });
    this.navigationService.currentSidebarState$.subscribe((state) => {
      this.sidebarState.set(state);
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.activeRoute.set(this.router.url);
      });
  }

  isActiveRoute(route: string) {
    return this.activeRoute() === route;
  }

  logout() {
    this.navigationService.logout();
  }

  loadChats(): void {
    this.chatService.getAllChats().subscribe({
      next: (chats) => {
        this.chats = chats;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des chats:', err);
      },
    });
  }

  goToChatPage(chat: any) {
    this.router.navigate(['/chat', chat.id]);
    this.activeChat = chat;
  }

  openNewChat() {
    window.location.href = 'chat/0';
  }
}
