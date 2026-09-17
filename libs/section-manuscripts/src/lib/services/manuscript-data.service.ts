import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FacsimileService {
  private facsimileSizeSubject = new Subject<string>();
  facsimileSize$ = this.facsimileSizeSubject.asObservable();

  private readonly visibleSubject = new BehaviorSubject<boolean>(true);
  readonly visible$: Observable<boolean> = this.visibleSubject.asObservable();

  get visible(): boolean {
    return this.visibleSubject.value;
  }

  changeFacsimileSize(size: string) {
    this.facsimileSizeSubject.next(size);
  }

  setVisible(visible: boolean): void {
    if (this.visibleSubject.value !== visible) {
      this.visibleSubject.next(visible);
    }
  }

  hide(): void {
    this.setVisible(false);
  }

  show(): void {
    this.setVisible(true);
  }

  toggle(): void {
    this.setVisible(!this.visibleSubject.value);
  }
}
