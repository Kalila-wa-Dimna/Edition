import { Component, Inject } from '@angular/core';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

export interface IEnglishPageInfo {
  display: string;
  siglum: string;
  image: string;
  first_chapter: string;
  first_page: string;
}

export interface IEnglishPageLink {
  index: number;
  page_number: number;
  page_link: string;
}

@Component({
  selector: 'kd-english-collation-panel',
  templateUrl: './english-collation-panel.component.html',
  styleUrls: ['./english-collation-panel.component.scss'],
  standalone: false,
})
export class EnglishCollationPanelComponent {
  constructor(
    private httpClient: HttpClient,
    @Inject(CONFIG_TOKEN) private config: IConfig
  ) {}

  allManuscripts$ = this.httpClient
    .get<IEnglishPageInfo[]>(
      `${this.config.dataEndPoint}manuscripts/englishAll.json`
    )
    .pipe(catchError(() => of([] as IEnglishPageInfo[])));

  /** Parallel page lists, same order as allManuscripts$. */
  englishPagesInMcChapter$: Observable<IEnglishPageLink[][]> =
    this.allManuscripts$.pipe(
      switchMap((manuscripts) => {
        if (!manuscripts.length) {
          return of([] as IEnglishPageLink[][]);
        }
        return forkJoin(
          manuscripts.map((manuscript) =>
            this.loadEnglishPages(manuscript.siglum)
          )
        );
      })
    );

  private loadEnglishPages(siglum: string): Observable<IEnglishPageLink[]> {
    const indexUrl = `${this.config.dataEndPoint}manuscripts/${siglum}/allEnglishPages.json`;
    return this.httpClient.get<IEnglishPageLink[]>(indexUrl).pipe(
      switchMap((pages) => {
        if (Array.isArray(pages) && pages.length) {
          return of(this.normalizePages(pages));
        }
        // Index empty/missing after data edits — rebuild from Mc-tagged Arabic pages.
        return this.buildEnglishPagesFromAllPages(siglum);
      }),
      catchError(() => this.buildEnglishPagesFromAllPages(siglum))
    );
  }

  private buildEnglishPagesFromAllPages(
    siglum: string
  ): Observable<IEnglishPageLink[]> {
    const url = `${this.config.dataEndPoint}manuscripts/${siglum}/allPages.json`;
    return this.httpClient.get<any[]>(url).pipe(
      map((pages) => {
        const byNumber = new Map<number, IEnglishPageLink>();
        for (const page of pages || []) {
          const tags: string[] = page?.tags || [];
          if (!tags.includes('Mc')) {
            continue;
          }
          const pageNumber = Number(page.page_number ?? page.number);
          if (!Number.isFinite(pageNumber)) {
            continue;
          }
          byNumber.set(pageNumber, {
            index: pageNumber,
            page_number: pageNumber,
            page_link: `/manuscripts/${siglum}/McEnglish/${pageNumber}`,
          });
        }
        return [...byNumber.values()].sort(
          (a, b) => a.page_number - b.page_number
        );
      }),
      catchError(() => of([] as IEnglishPageLink[]))
    );
  }

  private normalizePages(pages: IEnglishPageLink[]): IEnglishPageLink[] {
    return pages
      .map((page) => ({
        index: Number(page.index ?? page.page_number),
        page_number: Number(page.page_number),
        page_link: this.normalizeLink(page.page_link),
      }))
      .filter((page) => Number.isFinite(page.page_number) && !!page.page_link)
      .sort((a, b) => a.page_number - b.page_number);
  }

  private normalizeLink(link: string): string {
    if (!link) {
      return '';
    }
    return link.startsWith('/') ? link : `/${link}`;
  }

  pageRouterLink(page: IEnglishPageLink): string {
    return this.normalizeLink(page.page_link);
  }
}
