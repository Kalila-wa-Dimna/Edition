import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2,
  Output, EventEmitter,

} from '@angular/core';
import { Router,NavigationExtras,ActivatedRoute, NavigationEnd } from '@angular/router';
import { FontSizeService } from "./../../services/font-size.service";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, debounceTime,  filter } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import {Observable, Subscription,Subject} from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import {IChapterInfo} from "../../models/manuscript-summary.model";
import { ManuscriptPageService } from "./../../services/manuscript-page.resolver";
import {ManuscriptChapterPageService} from "./../../services/manuscript-chapter-page.service";
import {
  ManuscriptViewMode,
  ManuscriptViewModeService,
} from '../../services/manuscript-view-mode.service';
import {
  ManuscriptContentMode,
  ManuscriptContentModeService,
} from '../../services/manuscript-content-mode.service';
import { FacsimileService } from '../../services/manuscript-data.service';
import { ManuscriptDownloadsService } from '../../services/manuscript-downloads.service';
import { IPageData } from '../../models/page-data-model';

@Component({
    selector: 'kalila-edition-manuscript-page-command-bar',
    templateUrl: './manuscript-page-command-bar.component.html',
    styleUrls: ['./manuscript-page-command-bar.component.scss'],
    standalone: false
})
export class ManuscriptPageCommandBarComponent implements OnInit, OnDestroy{
  @ViewChild('subMenu') subMenu: MatMenuTrigger | undefined;
  @ViewChild(MatSidenav) sideNavRef!: MatSidenav;
  items!: any[];
  isSmallScreen!: boolean;
  manuscriptID='';
  chapter='';
  pageNumber='';
  activeSubMenu: any;
  englishMod=false;
  data:any;
  commandBarData$! : Observable<any>;
  combinedData$!: Observable<any>;
  sub?: Subscription;
  allChaptersData:IChapterInfo[]=[];
  manuscriptChapters: any[] = [];
  pageData:any;
  pageEnglishData:any;
  unitsData:any;
  allPagesData:any;
  isSidenavOpen:boolean=false;
  allEnglishPagesData:any;
  private destroy$ = new Subject<void>();
  private navigationInProgress = false;
  currentPageIndex=0;
  facsimileVisible = true;
  downloadBusy = false;
  private facsimileSub?: Subscription;
  private contentSub?: Subscription;
  @Output() closeClicked = new EventEmitter();
  constructor(
    private manuscriptChapterPageService: ManuscriptChapterPageService,
    private el: ElementRef,
    private renderer: Renderer2,
    private manuscriptPageService: ManuscriptPageService,
    public route: ActivatedRoute,
    private router: Router,
    private fontSizeService: FontSizeService,
    private breakpointObserver: BreakpointObserver,
    private viewModeService: ManuscriptViewModeService,
    private contentModeService: ManuscriptContentModeService,
    private facsimileService: FacsimileService,
    private downloads: ManuscriptDownloadsService
  ) {
    this.fontSizeService.setFontSize('15px');
    this.subscribeToRouterEvents();
  }

  get viewMode(): ManuscriptViewMode {
    return this.viewModeService.mode;
  }

  get contentMode(): ManuscriptContentMode {
    return this.contentModeService.mode;
  }

  setContentMode(mode: ManuscriptContentMode): void {
    this.contentModeService.setMode(mode);
  }

  private subscribeToRouterEvents() {
    this.router.events
      .pipe(
        debounceTime(50),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.callData(); // Call data initialization when the route changes
      });
  }

  private initializeData(data: any) {
    const {
      pageData,
      manuscriptChaptersData,
      allPagesData,
      allEnglishPagesData
    } = data;
    // Now you can access each resolved data object
    this.pageData = pageData;
    this.manuscriptChapters = Array.isArray(manuscriptChaptersData)
      ? manuscriptChaptersData
      : [];
    this.allPagesData = allPagesData;
    this.allEnglishPagesData = this.resolveEnglishPages(
      allEnglishPagesData,
      allPagesData,
      this.manuscriptID || this.route.snapshot.params['id']
    );
    this.currentPageIndex = this.allPagesData?.[0]?.index ?? 0;
    if(this.chapter=='McEnglish')
      this.englishMod=true;
    else this.englishMod=false;
  }

  /** Prefer allEnglishPages.json; if empty, rebuild from Mc-tagged allPages. */
  private resolveEnglishPages(
    englishPages: any,
    allPages: any,
    manuscriptId: string
  ): any[] {
    if (Array.isArray(englishPages) && englishPages.length) {
      return englishPages;
    }
    if (!Array.isArray(allPages) || !manuscriptId) {
      return [];
    }
    const byNumber = new Map<number, any>();
    for (const page of allPages) {
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
        page_link: `/manuscripts/${manuscriptId}/McEnglish/${pageNumber}`,
      });
    }
    return [...byNumber.values()].sort(
      (a, b) => Number(a.page_number) - Number(b.page_number)
    );
  }

  get chapters(): any[] {
    const chapters = [...(this.manuscriptChapters ?? [])];
    // Order by manuscript page range, not raw JSON order
    // (e.g. Lv p.7–29 comes before Im p.29–43).
    return chapters.sort((a, b) => {
      const aStart = this.chapterStartPage(a);
      const bStart = this.chapterStartPage(b);
      if (aStart !== bStart) {
        return aStart - bStart;
      }
      return this.chapterEndPage(a) - this.chapterEndPage(b);
    });
  }

  private chapterStartPage(chapterItem: any): number {
    const pages = chapterItem?.pages ?? [];
    if (!pages.length) {
      return Number.MAX_SAFE_INTEGER;
    }
    return Math.min(
      ...pages.map((page: { page_number?: number }) =>
        Number(page.page_number ?? Number.MAX_SAFE_INTEGER)
      )
    );
  }

  private chapterEndPage(chapterItem: any): number {
    const pages = chapterItem?.pages ?? [];
    if (!pages.length) {
      return Number.MAX_SAFE_INTEGER;
    }
    return Math.max(
      ...pages.map((page: { page_number?: number }) =>
        Number(page.page_number ?? Number.MIN_SAFE_INTEGER)
      )
    );
  }

  isCurrentChapter(chapterCode: string): boolean {
    const current = (this.chapter || '').replace('English', '');
    return current === chapterCode;
  }

  chapterTooltip(chapterItem: any): string {
    const pages = chapterItem?.pages ?? [];
    if (!pages.length) {
      return `Chapter ${chapterItem.chapter}`;
    }
    const first = pages[0].page_number;
    const last = pages[pages.length - 1].page_number;
    return `${chapterItem.chapter}: p. ${first}–${last}`;
  }

  navigateToChapter(chapterItem: any): void {
    const pages = chapterItem?.pages ?? [];
    if (!pages.length) {
      return;
    }
    const target =
      pages.find(
        (page: { page_number: number }) =>
          String(page.page_number) === String(this.pageNumber)
      ) ?? pages[0];
    this.router.navigateByUrl(this.normalizeLink(target.page_link), {
      relativeTo: this.route.parent,
    } as NavigationExtras);
  }

  private normalizeLink(link: string): string {
    if (!link) {
      return '/';
    }
    return link.startsWith('/') ? link : `/${link}`;
  }

  private syncRouteParams(): void {
    const { id, chapter, pageNumber } = this.route.snapshot.params;
    this.manuscriptID = id ?? this.manuscriptID;
    this.chapter = chapter ?? this.chapter;
    this.pageNumber = pageNumber ?? this.pageNumber;
    this.syncLanguageFromRoute();
  }

  private syncLanguageFromRoute(): void {
    if (!this.isEnglishClickable()) {
      this.viewModeService.setMode('source');
      this.englishMod = false;
      return;
    }
    if (this.viewModeService.mode === 'both') {
      this.englishMod = false;
      return;
    }
    this.englishMod = this.chapter === 'McEnglish';
    this.viewModeService.setMode(this.englishMod ? 'english' : 'source');
  }

  private sourceChapter(): string {
    return (this.chapter || '').replace('English', '') || 'Mc';
  }

  private currentPageLink(): string {
    return this.normalizeLink(
      `/manuscripts/${this.manuscriptID}/${this.chapter}/${this.pageNumber}`
    );
  }

  private findPageIndex(
    pages: Array<{ page_number: number; page_link: string }>
  ): number {
    if (!pages?.length) {
      return -1;
    }

    const currentLink = this.currentPageLink();
    const byLink = pages.findIndex(
      (page) => this.normalizeLink(page.page_link) === currentLink
    );
    if (byLink !== -1) {
      return byLink;
    }

    // Boundary pages can appear twice with the same page_number but different
    // chapter links (e.g. Lv/29 and Im/29). Match chapter as well.
    const pageNumber = Number(this.pageNumber);
    const chapter = this.chapter || '';
    return pages.findIndex((page) => {
      const link = this.normalizeLink(page.page_link);
      return (
        Number(page.page_number) === pageNumber &&
        link.includes(`/${chapter}/`)
      );
    });
  }

  /** Step to the next/previous manuscript page by page number, not raw JSON order. */
  private navigateRelativePage(direction: 1 | -1): void {
    this.syncRouteParams();
    const both = this.viewMode === 'both';
    const pages =
      this.englishMod && !both ? this.allEnglishPagesData : this.allPagesData;
    if (!pages?.length || !this.pageNumber) {
      return;
    }

    // In Both mode navigate the Arabic Mc route; companion English is loaded in the text pane.
    const chapter = both ? this.sourceChapter() : this.chapter || '';
    if (both && this.chapter !== chapter) {
      this.chapter = chapter;
    }

    const currentIndex = this.findPageIndex(pages);
    if (currentIndex === -1) {
      return;
    }

    const currentNumber = Number(pages[currentIndex].page_number);
    let candidates = pages.filter((page: { page_number: number }) =>
      direction === 1
        ? Number(page.page_number) > currentNumber
        : Number(page.page_number) < currentNumber
    );

    if (!candidates.length) {
      return;
    }

    const targetNumber =
      direction === 1
        ? Math.min(
            ...candidates.map((page: { page_number: number }) =>
              Number(page.page_number)
            )
          )
        : Math.max(
            ...candidates.map((page: { page_number: number }) =>
              Number(page.page_number)
            )
          );

    candidates = candidates.filter(
      (page: { page_number: number }) =>
        Number(page.page_number) === targetNumber
    );

    const preferred =
      candidates.find((page: { page_link: string }) =>
        this.normalizeLink(page.page_link).includes(`/${chapter}/`)
      ) ?? candidates[0];

    this.router.navigateByUrl(this.normalizeLink(preferred.page_link), {
      relativeTo: this.route.parent,
    } as NavigationExtras);
  }
  callLinkData() {
    this.router.events.pipe(debounceTime(50)).subscribe(() => {
      // Extract route parameters
      const { id, chapter, pageNumber } = this.route.snapshot.params;
      // Update properties as needed
      this.pageNumber = pageNumber;
      this.manuscriptID = id;
      this.chapter = chapter;
      this.syncLanguageFromRoute();
      this.callData(); // Call data initialization
      // Rest of your code here
    });
  }

  callData() {
    this.route.data.subscribe((data: any) => {
      this.initializeData(data); // Call the common data initialization logic
    });
  }
  ngOnInit() {
    const { id, chapter, pageNumber } = this.route.snapshot.params;
    this.manuscriptID = id ?? '';
    this.chapter = chapter ?? '';
    this.pageNumber = pageNumber ?? '';
    if (this.viewMode !== 'both') {
      this.englishMod = this.chapter === 'McEnglish';
      this.viewModeService.setMode(this.englishMod ? 'english' : 'source');
    } else {
      this.englishMod = false;
    }
    this.data = this.route.snapshot.data;
    this.initializeData(this.data);
    this.callLinkData();
    this.facsimileVisible = this.facsimileService.visible;
    this.facsimileSub = this.facsimileService.visible$.subscribe((visible) => {
      this.facsimileVisible = visible;
    });

    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall])
      .pipe(map((result) => result.matches))
      .subscribe((matches) => {
        this.isSmallScreen = matches;
      });
  }

  isEnglishClickable(): boolean {
    return this.chapter === 'Mc' || this.chapter === 'McEnglish';
  }

  get isHebrewManuscript(): boolean {
    return /hebrew/i.test(this.manuscriptID || '');
  }

  get sourceLanguageLabel(): string {
    return this.isHebrewManuscript ? 'Hebrew' : 'Arabic';
  }
  shouldDisableButton(item: any): boolean {
    // Add your condition here
    // For example, to disable the "English" button when chapter is not 'Mc' or 'McEnglish':
    if (item.label === 'English' && this.chapter !== 'Mc' && this.chapter !== 'McEnglish') {
      return true;
    }
    return false;
  }
  /*async navigateToTheSelectedManuscript(manuscriptId: string) {
      const chapter = this.chapter;
    const { page: pageNumber, flag } = await this.getFirstPageForChapter(manuscriptId.toString());
      if(flag===1) {
        // The chapter exists in the selected manuscript
        await this.router.navigateByUrl(
          `/manuscripts/${manuscriptId}/${chapter}/${pageNumber}`,
          {relativeTo: this.route.parent} as NavigationExtras
        );
      }
      else{
        await this.router.navigateByUrl(
          `/manuscripts/${manuscriptId}/Lv/${pageNumber}`,
          {relativeTo: this.route.parent} as NavigationExtras
        );
      }
  }
*/
/*
  getFirstPageForChapter(manuscriptId: string): { page: any, flag: number } {
    // Reset allChaptersData before using it
    const chapterEntry = this.chapterToMsData.find(entry =>
      entry.manuscript.toLowerCase() === manuscriptId.toLowerCase()
    );

    if (chapterEntry) {
      return { page: chapterEntry['from'], flag: 1 };
    } else {
      const chEntry = this.allChaptersData.find(entry =>
        entry.manuscript.toLowerCase() === manuscriptId.toLowerCase()
      );

      if (chEntry) {
        return { page: chEntry['from'], flag: 0 };
      } else {
        return { page: null, flag: -1 }; // Return a default value or indicator for not found
      }
    }
  }

*/


  navigateToTheNextPage(): void {
    this.navigateRelativePage(1);
  }


  changeToEnglish() {
    if (!this.isEnglishClickable()) {
      return;
    }
    this.viewModeService.setMode('english');
    this.englishMod = true;

    if (!this.chapter.endsWith('English')) {
      this.chapter = this.chapter + 'English';
    }

    this.manuscriptChapterPageService.setManuscriptChapterPage(
      this.manuscriptID,
      this.chapter,
      this.pageNumber
    );

    this.router.navigateByUrl(
      `/manuscripts/${this.manuscriptID}/${this.chapter}/${this.pageNumber}`,
      { relativeTo: this.route.parent } as NavigationExtras
    );
  }

  changeToBoth() {
    if (!this.isEnglishClickable()) {
      return;
    }
    this.viewModeService.setMode('both');
    this.englishMod = false;

    const chapter = this.sourceChapter();
    if (this.chapter === chapter) {
      return;
    }

    this.chapter = chapter;
    this.manuscriptChapterPageService.setManuscriptChapterPage(
      this.manuscriptID,
      this.chapter,
      this.pageNumber
    );
    this.router.navigateByUrl(
      `/manuscripts/${this.manuscriptID}/${this.chapter}/${this.pageNumber}`,
      { relativeTo: this.route.parent } as NavigationExtras
    );
  }

  changeToSourceLanguage() {
    this.changeToArabic();
  }

  changeToArabic() {
    // Returns to the manuscript source language (Arabic or Hebrew).
    this.viewModeService.setMode('source');
    this.englishMod = false;

    this.chapter = this.chapter.replace('English', '');

    this.manuscriptChapterPageService.setManuscriptChapterPage(
      this.manuscriptID,
      this.chapter,
      this.pageNumber
    );

    this.router.navigateByUrl(
      `/manuscripts/${this.manuscriptID}/${this.chapter}/${this.pageNumber}`,
      { relativeTo: this.route.parent } as NavigationExtras
    );
  }

  navigateToThePreviousPage(): void {
    this.navigateRelativePage(-1);
  }

  toggleFacsimile(): void {
    this.facsimileService.toggle();
  }

  openGallery() {

    this.manuscriptChapterPageService.setManuscriptChapterPage(this.manuscriptID,this.chapter,this.pageNumber);
    this.router.navigateByUrl(
      `/manuscripts/${this.manuscriptID}/gallery`,
      { relativeTo: this.route.parent } as NavigationExtras );
  }

  async downloadCurrentXml(): Promise<void> {
    this.syncRouteParams();
    const page = this.pageData as IPageData;
    if (!page?.lines) {
      return;
    }
    await this.downloads.downloadCurrentPageXml(
      page,
      this.manuscriptID,
      this.sourceChapter()
    );
  }

  async downloadCurrentJson(): Promise<void> {
    this.syncRouteParams();
    const page = this.pageData as IPageData;
    if (!page) {
      return;
    }
    await this.downloads.downloadCurrentPageJson(page, this.manuscriptID);
  }

  async downloadAllText(): Promise<void> {
    await this.runBulkDownload(() =>
      this.downloads.downloadAllPagesAsText(
        this.manuscriptID,
        this.allPagesData ?? []
      )
    );
  }

  async downloadAllImages(): Promise<void> {
    await this.runBulkDownload(() =>
      this.downloads.downloadAllPagesAsImages(
        this.manuscriptID,
        this.allPagesData ?? []
      )
    );
  }

  async downloadAllXml(): Promise<void> {
    await this.runBulkDownload(() =>
      this.downloads.downloadAllPagesAsXml(
        this.manuscriptID,
        this.allPagesData ?? []
      )
    );
  }

  async downloadAllJson(): Promise<void> {
    await this.runBulkDownload(() =>
      this.downloads.downloadAllPagesAsJson(
        this.manuscriptID,
        this.allPagesData ?? []
      )
    );
  }

  private async runBulkDownload(task: () => Promise<void>): Promise<void> {
    if (this.downloadBusy) {
      return;
    }
    this.syncRouteParams();
    if (!this.manuscriptID || !this.allPagesData?.length) {
      return;
    }
    this.downloadBusy = true;
    try {
      await task();
    } catch (err) {
      console.error('Download failed', err);
      const message =
        err instanceof Error ? err.message : 'Download failed. Please try again.';
      window.alert(message);
    } finally {
      this.downloadBusy = false;
    }
  }

  hasSubItems(item: any): boolean {
    return item && item.items && item.items.length > 0;
  }

  toggleSubMenu(item: any): void {
    this.activeSubMenu = this.activeSubMenu === item ? null : item;
    if (this.subMenu) {
      this.subMenu.openMenu();
    }
  }

  executeCommand(item: any): void {
    if (item.items) {
      this.toggleSubMenu(item);
    } else {
      // Execute the command for the item
      item.command?.();
    }
  }

  openNavbar() {
    this.sideNavRef.open();
  }

  getPages(firstPage: string, lastPage: string): string[] {
    const pages: string[] = [];
    const startPage = parseInt(firstPage, 10); // Convert to number
    const endPage = parseInt(lastPage, 10); // Convert to number

    for (let page = startPage; page <= endPage; page++) {
      pages.push(page.toString()); // Convert back to string before pushing
    }

    return pages;
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.facsimileSub?.unsubscribe();
    this.contentSub?.unsubscribe();
  }
}

