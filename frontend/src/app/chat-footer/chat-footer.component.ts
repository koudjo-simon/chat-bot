import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { API_URL } from '../constant';

@Component({
  selector: 'app-chat-footer',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chat-footer.component.html',
  styleUrl: './chat-footer.component.scss',
})
export class ChatFooterComponent {
  private API_URL = API_URL;
  formattedContent: Array<{
    language?: string;
    content: string;
    isCode: boolean;
  }> = [];
  response = '';
  language = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  formGroup!: FormGroup;

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      message: [''],
    });
  }

  handleOnSubmit() {
    const message = this.formGroup.value?.message;
    let prompt = {
      prompt: message,
    };

    this.http.post(`${this.API_URL}/generate`, prompt).subscribe((res: any) => {
      console.log(res);
      const regex = /```(\w+)\n([\s\S]*?)```/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(res.response)) !== null) {
        // Ajouter le texte avant le bloc de code (s'il y en a)
        if (match.index > lastIndex) {
          this.formattedContent.push({
            content: res.response.slice(lastIndex, match.index),
            isCode: false,
          });
        }

        // Ajouter le bloc de code
        this.formattedContent.push({
          language: match[1], // Le langage spécifié (ex: python)
          content: match[2], // Le contenu du code
          isCode: true,
        });

        lastIndex = regex.lastIndex;
      }

      // Ajouter le texte après le dernier bloc de code
      if (lastIndex < res.response.length) {
        this.formattedContent.push({
          content: res.response.slice(lastIndex),
          isCode: false,
        });
      }
    });
  }
}
