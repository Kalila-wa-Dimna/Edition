import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** What the left text panel shows next to the facsimile. */
export type ManuscriptContentMode = 'transcription' | 'xml' | 'both';

@Injectable({
  providedIn: 'root',
})
export class ManuscriptContentModeService {
  private readonly modeSubject = new BehaviorSubject<ManuscriptContentMode>(
    'transcription'
  );

  readonly mode$: Observable<ManuscriptContentMode> =
    this.modeSubject.asObservable();

  get mode(): ManuscriptContentMode {
    return this.modeSubject.value;
  }

  setMode(mode: ManuscriptContentMode): void {
    if (this.modeSubject.value !== mode) {
      this.modeSubject.next(mode);
    }
  }
}
