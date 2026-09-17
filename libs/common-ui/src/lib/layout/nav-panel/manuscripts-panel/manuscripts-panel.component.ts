import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { combineLatest, filter, map, startWith, Subscription } from 'rxjs';

@Component({
  selector: 'kd-manuscripts-panel',
  templateUrl: './manuscripts-panel.component.html',
  styleUrls: ['./manuscripts-panel.component.scss'],
  standalone: false,
})
export class ManuscriptsPanelComponent implements OnInit, OnDestroy {
  filterFormControl = new FormControl('');
  manuscripts: any[] = [];
  selectedIndex = 0;
  selectedSiglum = '';
  selectedChapters: any[] = [];
  chaptersLoading = false;
  chaptersError = '';

  private chaptersBySiglum: Record<string, any[]> = {};
  private loading = new Set<string>();
  private sub?: Subscription;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(CONFIG_TOKEN) private config: IConfig
  ) {}

  ngOnInit(): void {
    const manuscripts$ = combineLatest([
      this.httpClient.get<any[]>(
        `${this.config.dataEndPoint}manuscripts/all.json`
      ),
      this.filterFormControl.valueChanges.pipe(startWith('')),
    ]).pipe(
      map(([data, filterText]) => {
        if (filterText && filterText.length !== 0) {
          return data.filter((item) =>
            item.siglum
              .toLowerCase()
              .includes(filterText.toLocaleLowerCase())
          );
        }
        return data;
      })
    );

    this.sub = manuscripts$.subscribe((list) => {
      this.manuscripts = list ?? [];
      const fromUrl = this.manuscriptIndexFromUrl();
      this.selectByIndex(fromUrl === -1 ? 0 : fromUrl);
      this.cdr.detectChanges();
    });

    this.sub.add(
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe(() => {
          const fromUrl = this.manuscriptIndexFromUrl();
          if (fromUrl !== -1) {
            this.selectByIndex(fromUrl);
            this.cdr.detectChanges();
          }
        })
    );
  }

  onTabChange(index: number): void {
    this.selectByIndex(index);
  }

  pageLink(page: { page_link?: string }): string {
    const link = page?.page_link || '';
    return link.startsWith('/') ? link : `/${link}`;
  }

  private selectByIndex(index: number): void {
    if (!this.manuscripts.length) {
      this.selectedSiglum = '';
      this.selectedChapters = [];
      return;
    }
    const safeIndex = Math.max(0, Math.min(index, this.manuscripts.length - 1));
    this.selectedIndex = safeIndex;
    this.selectedSiglum = String(this.manuscripts[safeIndex]?.siglum || '');
    this.chaptersError = '';
    this.loadChapters(this.selectedSiglum, true);
  }

  private loadChapters(siglum: string, forceShow: boolean): void {
    if (!siglum) {
      return;
    }

    // Use `in` so an earlier failed [] response can be retried when needed
    if (Object.prototype.hasOwnProperty.call(this.chaptersBySiglum, siglum)) {
      this.selectedChapters = this.chaptersBySiglum[siglum];
      this.chaptersLoading = false;
      this.cdr.detectChanges();
      return;
    }

    if (this.loading.has(siglum)) {
      this.chaptersLoading = forceShow;
      return;
    }

    this.loading.add(siglum);
    this.chaptersLoading = true;
    this.selectedChapters = [];

    const url = `${this.config.dataEndPoint}manuscripts/${encodeURIComponent(
      siglum
    )}/allChapters.json`;

    this.httpClient.get<any[]>(url).subscribe({
      next: (chapters) => {
        const list = Array.isArray(chapters) ? chapters : [];
        this.chaptersBySiglum[siglum] = list;
        this.loading.delete(siglum);
        if (this.selectedSiglum === siglum) {
          this.selectedChapters = list;
          this.chaptersLoading = false;
          this.chaptersError = list.length
            ? ''
            : `No chapters in data for ${siglum}`;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading.delete(siglum);
        // Do not cache failures forever
        if (this.selectedSiglum === siglum) {
          this.selectedChapters = [];
          this.chaptersLoading = false;
          this.chaptersError = `Could not load chapters for ${siglum}`;
        }
        console.error('Chapter load failed', url, err);
        this.cdr.detectChanges();
      },
    });
  }

  private manuscriptIndexFromUrl(): number {
    const match = this.router.url.match(/\/manuscripts\/([^/?#]+)/i);
    if (!match?.[1] || match[1].toLowerCase() === 'illustrations') {
      return -1;
    }
    const current = decodeURIComponent(match[1]);
    return this.manuscripts.findIndex(
      (item) =>
        String(item.siglum).toLowerCase() === String(current).toLowerCase()
    );
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
