import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { API_URL } from '../constant';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Message } from '../shared/model/message.model';
import { v4 as uuidv4 } from 'uuid';
import { MatCardModule } from '@angular/material/card';
import { MessagePart } from '../shared/model/message-part.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NavigationService } from '../shared/navigation.service';
import { ChatService } from '../shared/services/chat.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit {
  private connectedUser: any;
  messages: Message[] = [];
  response = '';
  language = '';
  private chatId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private chatService: ChatService,
    private navService: NavigationService,
    private route: ActivatedRoute
  ) {}
  loggedUser = JSON.parse(sessionStorage.getItem('loggedinUser') || '{}');
  userName = this.loggedUser.name;

  formGroup!: FormGroup;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const chatIdParam = params.get('id');
      if (chatIdParam !== null) {
        this.chatId = +chatIdParam;
        if (this.chatId == 0) {
          this.chatId == null;
        } else if (this.chatId) {
          this.loadMessages(this.chatId);
        } else {
        }
      }
    });
    this.formGroup = this.fb.group({
      message: ['', [Validators.required]],
    });
    this.http
      .get(
        `${API_URL}/user?email=${
          JSON.parse(sessionStorage.getItem('loggedinUser') || '{}').email
        }`
      )
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            const newUser = {
              name: this.loggedUser.name,
              email: this.loggedUser.email,
            };
            return this.http.post(`${API_URL}/user`, newUser);
          } else {
            return of(null);
          }
        })
      )
      .subscribe({
        next: (user: any) => {
          this.connectedUser = user; // Stocker l'utilisateur récupéré dans la variable
          console.log('Utilisateur récupérer: ', JSON.stringify(user, null, 2)); // Afficher l'utilisateur dans la console pour vérification
        },
      });
  }

  handleOnSubmit() {
    let messagePart: MessagePart[] = [];
    const message: string = this.formGroup.value?.message;
    let prompt = {
      prompt: message,
    };

    messagePart.push({
      part: message,
    });

    if (!this.chatId) {
      // Créer un nouveau chat si chatId est undefined
      const newChat = {
        userId: this.connectedUser.id,
        name: `${message.length > 50 ? message.substring(0, 50) : message}`,
      };

      this.http.post(`${API_URL}/chat`, newChat).subscribe({
        next: (chat: any) => {
          this.chatId = chat.id; // Stocker le nouvel ID de chat
          this.sendMessage(messagePart, prompt);
        },
        error: (err) => {
          console.error('Erreur lors de la création du chat:', err);
        },
      });
    } else {
      this.sendMessage(messagePart, prompt);
    }
  }

  sendMessage(messagePart: MessagePart[], prompt: any) {
    const userMessage = {
      id: uuidv4(),
      content: messagePart,
      createdAt: new Date(),
      sender: 'user',
    };

    this.messages.push(userMessage);

    this.formGroup.patchValue({
      message: '',
    });

    this.saveMessage(userMessage);

    this.http.post(`${API_URL}/generate`, prompt).subscribe({
      next: (res: any) => {
        this.parseResponse(res.response);
        const botMessage = {
          id: uuidv4(),
          content: [{ part: res.response }],
          createdAt: new Date(),
          sender: 'bot',
        };
        this.saveMessage(botMessage);
      },
      error: (err) => {
        console.error('Erreur lors de la génération de la réponse:', err);
      },
    });
  }

  saveMessage(message: any) {
    const messageData = {
      createdAt: message.createdAt,
      sender: message.sender,
      chatId: this.chatId,
      parts: message.content,
    };

    this.http.post(`${API_URL}/message`, messageData).subscribe({
      next: (res: any) => {
        console.log('Message enregistré avec succès:', res);
      },
      error: (err) => {
        console.error("Erreur lors de l'enregistrement du message:", err);
      },
    });
  }

  parseResponse(response: string): MessagePart[] {
    const sections = response.split(/```(.*?)```/gs);
    let messageParts: MessagePart[] = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();

      if (i % 2 === 0) {
        // C'est du texte simple ou explicatif (partie en dehors des balises ```)
        if (section) {
          messageParts.push({
            part: section,
          });
        }
      } else {
        // C'est un bloc de code avec un langage
        const [language, ...codeLines] = section.split('\n');
        const code = codeLines.join('\n').trim();
        const formattedContent = {
          language: language.trim(),
          code: code,
        };

        messageParts.push({
          part: JSON.stringify(formattedContent),
        });
      }
    }

    this.messages.push({
      id: uuidv4(),
      content: messageParts, // Convertir en JSON pour pouvoir utiliser dans le template
      createdAt: new Date(),
      sender: 'bot',
    });

    // Retourner les paties du messages
    return messageParts;
  }

  isJson(content: string): boolean {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  loadMessages(chatId: number): void {
    this.chatService.getChatMessages(chatId).subscribe({
      next: (messages: Message[]) => {
        messages.map((message) => {
          if (message.sender == 'bot') {
            message.content = this.parseResponse(message.content[0].part);
          }
        });
        console.log(messages);
        this.messages = messages;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des messages:', err);
      },
    });
  }

  getLanguageFromContent(content: string): string {
    const parsedContent = JSON.parse(content);
    return parsedContent.language || 'Code';
  }

  getCodeFromContent(content: string): string {
    const parsedContent = JSON.parse(content);
    return parsedContent.code || '';
  }

  logout() {
    this.navService.logout();
  }
}
