import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AiPromptService {
  private apiKey = environment.secretEnvironment.GEMINI_API_KEY;
  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

  constructor(private http: HttpClient) { }

  generateAdvice(message: string, chatbotRole: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      system_instruction: {
        parts: [
          {
            text: chatbotRole
          }
        ]
      },
      contents: [
        {
          parts: [
            {
              text: message
            }
          ]
        }
      ]
    }

    return this.http.post(this.apiUrl, body, { headers });
  }
}
