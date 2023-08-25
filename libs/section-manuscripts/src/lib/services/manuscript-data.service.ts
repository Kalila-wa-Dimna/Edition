import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacsimileService {
  private facsimileSizeSubject = new Subject<string>();
  facsimileSize$ = this.facsimileSizeSubject.asObservable();

  changeFacsimileSize(size: string) {
    this.facsimileSizeSubject.next(size);
  }
}
