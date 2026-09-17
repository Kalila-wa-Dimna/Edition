import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Router,
  NavigationExtras,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';
import { debounceTime, filter } from 'rxjs/operators';
import { ManuscriptChapterPageService } from '../../services/manuscript-chapter-page.service';
import { Subscription } from 'rxjs';
import { IManuscriptInfo } from '../../models/manuscript-summary.model';

@Component({
  selector: 'kalila-edition-manuscript-page-gallery-command-bar',
  templateUrl: './manuscript-page-gallery-command-bar.component.html',
  styleUrls: ['./manuscript-page-gallery-command-bar.component.scss'],
  standalone: false,
})
export class ManuscriptPageGalleryCommandBarComponent
  implements OnInit, OnDestroy
{
  manuscriptID = '';
  chapter = '';
  page = '';
  sub?: Subscription;
  manuscriptsInfo: IManuscriptInfo[] = [];
  selecterGallery = '';
  currentGalleryId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private manuscriptChapterPageService: ManuscriptChapterPageService
  ) {
    const { manuscript, chapter, page } =
      manuscriptChapterPageService.getManuscriptChapterPage();
    this.manuscriptID = manuscript;
    this.chapter = chapter;
    this.page = page;
  }

  ngOnInit() {
    this.refreshBarState();

    this.sub = this.router.events
      .pipe(
        debounceTime(50),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.refreshBarState();
      });
  }

  isSelectedManuscript(siglum: string): boolean {
    if (!siglum || !this.currentGalleryId) {
      return false;
    }
    return siglum.toLowerCase() === this.currentGalleryId.toLowerCase();
  }

  /**
   * Named outlets don't always expose parent resolve data on `this.route`.
   * Walk up the route tree for `id` + `manuscriptsInfo`.
   */
  private refreshBarState(): void {
    let id = '';
    let manuscriptsInfo: IManuscriptInfo[] = [];
    let current: ActivatedRoute | null = this.route;

    while (current) {
      const routeId = current.snapshot.paramMap.get('id');
      if (routeId) {
        id = routeId;
      }
      const info = current.snapshot.data['manuscriptsInfo'];
      if (Array.isArray(info) && info.length) {
        manuscriptsInfo = info;
      }
      current = current.parent;
    }

    if (!id) {
      const match = this.router.url.match(
        /\/manuscripts\/([^/?#]+)\/gallery/i
      );
      if (match?.[1]) {
        id = decodeURIComponent(match[1]);
      }
    }

    this.selecterGallery = id;
    this.currentGalleryId = id;
    this.manuscriptsInfo = manuscriptsInfo;
  }

  navigateToFacsimileText() {
    let manuscriptId = this.manuscriptID;
    let chapter = this.chapter;
    let page = this.page;

    if (this.selecterGallery !== this.manuscriptID) {
      const selectedManuscript = this.manuscriptsInfo.find(
        (manuscript) => manuscript.siglum === this.selecterGallery
      );

      if (selectedManuscript) {
        this.manuscriptChapterPageService.setManuscriptChapterPage(
          selectedManuscript.siglum,
          selectedManuscript.first_chapter,
          selectedManuscript.first_page
        );
        const saved = this.manuscriptChapterPageService.getManuscriptChapterPage();
        this.manuscriptID = saved.manuscript;
        this.chapter = saved.chapter;
        this.page = saved.page;
      }

      this.router.navigateByUrl(
        `/manuscripts/${this.manuscriptID}/${this.chapter}/${this.page}`,
        { relativeTo: this.route.parent } as NavigationExtras
      );
      return;
    }

    if (manuscriptId === '' || chapter === '' || page === '') {
      const result = this.getFirstChapterAndPage(
        this.selecterGallery || this.currentGalleryId,
        this.manuscriptsInfo
      );
      if (result) {
        manuscriptId = this.selecterGallery || this.currentGalleryId;
        chapter = result.chapter;
        page = result.page;
      }
    }

    this.router.navigateByUrl(
      `/manuscripts/${manuscriptId}/${chapter}/${page}`,
      { relativeTo: this.route.parent } as NavigationExtras
    );
  }

  getFirstChapterAndPage(
    id: string,
    manuscriptsData: IManuscriptInfo[]
  ): { chapter: string; page: string } | null {
    const entry = manuscriptsData.find(
      (manuscript) => manuscript.siglum.toLowerCase() === id.toLowerCase()
    );
    if (!entry) {
      return null;
    }
    return {
      chapter: entry.first_chapter,
      page: entry.first_page,
    };
  }

  navigateToTheSelectedManuscript(manuscriptId: string) {
    this.router.navigateByUrl(`/manuscripts/${manuscriptId}/gallery`, {
      relativeTo: this.route.parent,
    } as NavigationExtras);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
