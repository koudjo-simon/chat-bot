import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../constant';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient) {}

  getAllChats(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/chats`);
  }

  getChatMessages(chatId: number): Observable<any> {
    return this.http.get(`${API_URL}/chats/${chatId}/messages`);
  }
}
