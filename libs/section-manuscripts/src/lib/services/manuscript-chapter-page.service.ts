import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ManuscriptChapterPageService {
  manuscript: string = '';
  chapter: string = '';
  page: string = '';

  private ManuscriptChapterPageSubject = new Subject<{ manuscript: string, chapter: string, page: string }>();

  getManuscriptChapterPage(): { manuscript: string, chapter: string, page: string } {
    return { manuscript: this.manuscript, chapter: this.chapter, page: this.page };
  }

  setManuscriptChapterPage(manuscript: string, chapter: string, page: string): void {
    this.manuscript = manuscript;
    this.chapter = chapter;
    this.page = page;
    // Notify subscribers about the changes
    this.ManuscriptChapterPageSubject.next({ manuscript, chapter, page });
  }

  getManuscriptChapterPageObservable(): Observable<{ manuscript: string, chapter: string, page: string }> {
    return this.ManuscriptChapterPageSubject.asObservable();
  }
}

