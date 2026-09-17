import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ManuscriptViewMode = 'source' | 'english' | 'both';

@Injectable({
  providedIn: 'root',
})
export class ManuscriptViewModeService {
  private readonly modeSubject = new BehaviorSubject<ManuscriptViewMode>(
    'source'
  );

  readonly mode$: Observable<ManuscriptViewMode> =
    this.modeSubject.asObservable();

  get mode(): ManuscriptViewMode {
    return this.modeSubject.value;
  }

  setMode(mode: ManuscriptViewMode): void {
    if (this.modeSubject.value !== mode) {
      this.modeSubject.next(mode);
    }
  }
}
