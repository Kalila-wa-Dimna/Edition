import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RobotService {
  private apiUrl = 'https://3elss3aorh.execute-api.eu-central-1.amazonaws.com/prod/translate';
  response$ = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  sendText(text: string) {
    if (!text.trim()) {
      this.response$.next('No text provided.');
      return;
    }

    this.http
      .post<{ translation: string }>(this.apiUrl, { text })
      .subscribe({
        next: (res) => {
          this.response$.next(res.translation);
        },
        error: (err) => {
         // console.error('❌ Translation failed:', err);
          this.response$.next('Translation failed.');
        },
      });
  }
}
