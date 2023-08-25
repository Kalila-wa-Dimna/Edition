import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FontSizeService {

  fontSize='15px';
  private fontSizeSubject = new Subject<string>();

  getFontSize(): string {
    return this.fontSize;
  }

  setFontSize(size: string): void {
    this.fontSize = size;
    this.fontSizeSubject.next(size); // Notify subscribers about the font size change
  }

  getFontSizeObservable(): Observable<string> {
    return this.fontSizeSubject.asObservable();
  }
}
