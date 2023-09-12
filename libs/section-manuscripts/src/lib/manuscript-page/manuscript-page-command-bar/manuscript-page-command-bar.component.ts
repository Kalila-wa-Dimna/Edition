import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2,
  Output, EventEmitter,

} from '@angular/core';
import { Router,NavigationExtras,ActivatedRoute, NavigationEnd } from '@angular/router';
import { FacsimileService } from "./../../services/manuscript-data.service";
import { FontSizeService } from "./../../services/font-size.service";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, debounceTime,  filter } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import {Observable, combineLatest, Subscription,Subject} from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import {IChapterInfo, IManuscriptInfo} from "../../models/manuscript-summary.model";
import { ManuscriptPageService } from "./../../services/manuscript-page.resolver";
import {ManuscriptChapterPageService} from "./../../services/manuscript-chapter-page.service";

@Component({
  selector: 'kalila-edition-manuscript-page-command-bar',
  templateUrl: './manuscript-page-command-bar.component.html',
  styleUrls: ['./manuscript-page-command-bar.component.scss'],
})
export class ManuscriptPageCommandBarComponent implements OnInit, OnDestroy{
  @ViewChild('subMenu') subMenu: MatMenuTrigger | undefined;
  @ViewChild(MatSidenav) sideNavRef!: MatSidenav;
  items!: any[];
  isSmallScreen!: boolean;
  fontSize=15;
  facsimileSize=65;
  manuscriptID='';
  chapter='';
  pageNumber='';
  activeSubMenu: any;

  data:any;
  commandBarData$! : Observable<any>;
  combinedData$!: Observable<any>;
  sub?: Subscription;
  allChaptersData:IChapterInfo[]=[];
  manuscriptChapters:any;
  pageData:any;
  unitsData:any;
  allPagesData:any;
  isSidenavOpen:boolean=false;
  chapterToMsData:IChapterInfo[]=[];
  private destroy$ = new Subject<void>();
  private navigationInProgress = false;
  currentPageIndex=0;
  @Output() closeClicked = new EventEmitter();
  constructor( private manuscriptChapterPageService:ManuscriptChapterPageService,private el: ElementRef,private renderer: Renderer2, private manuscriptPageService: ManuscriptPageService, private cdr: ChangeDetectorRef, public route: ActivatedRoute,private router: Router, private facsimileService: FacsimileService, private fontSizeService:FontSizeService,private breakpointObserver: BreakpointObserver  ) {
  this.fontSizeService.setFontSize('15px');
    this.subscribeToRouterEvents();
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
      chapterToMsData,
      chapterThatAllMsHave,
      manuscriptChaptersData,
      allPagesData,
    } = data;
    // Now you can access each resolved data object
    this.pageData = pageData;
    this.allChaptersData = chapterThatAllMsHave;
    this.chapterToMsData = chapterToMsData;
    this.manuscriptChapters = manuscriptChaptersData;
    this.allPagesData = allPagesData;
    this.currentPageIndex = this.allPagesData[0].index;
  }
  callLinkData() {
    this.router.events.pipe(debounceTime(50)).subscribe(() => {
      // Extract route parameters
      const { id, chapter, pageNumber } = this.route.snapshot.params;
      // Update properties as needed
      this.pageNumber = pageNumber;
      this.manuscriptID = id;
      this.chapter = chapter;
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
    this.callLinkData();
    this.data=this.route.snapshot.data;

      this.items =   [
        {
          label: 'Font resize',
          icon: 'format_size',
          styleClass: 'menucus',
          items: [
            { label: 'Font size', icon: 'add', command: () => this.increaseFontSize()
            },
            { label: 'Font size', icon: 'remove',command:() => this.decreaseFontSize()
            }
          ]
        },
      {
        /*label: 'Select MS',
        icon: 'book',
        styleClass: 'menucus',
        items: [
          { label: 'Pococke 400', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P400'),this.ngOnDestroy()}},
          { label: 'Parker 578', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('CCCP578')}},
          { label: 'Paris 5881', icon: 'book',command: () =>{ this.navigateToTheSelectedManuscript('P5881'),this.ngOnDestroy()} },
          { label: 'Paris 3465', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P3465')} },
          { label: 'Paris 3466', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P3466')}},
          { label: 'Ayasofya 4095', icon: 'book' ,command: () => {this.navigateToTheSelectedManuscript('A4095')}},
          { label: 'Paris 3471', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P3471')}},
          { label: 'Paris 3475', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P3475')} },
          { label: 'Paris 3473', icon: 'book',command: () =>{ this.navigateToTheSelectedManuscript('P3473')} },
        ]
      },
      {
        label: 'Select page',
        icon: 'description',
        styleClass: 'menucus',
        command:() => this.openNavbar(),
      }, {*/

       label: 'Prev',  icon:'arrow_back_ios_new' ,command:()=> {this.navigateToThePreviousPage(), this.ngOnDestroy()}},
      { label: ' ',  icon:' '},

      { label: 'Next',  icon: 'arrow_forward_ios', command:()=> {this.navigateToTheNextPage(), this.ngOnDestroy()}},

        {
          label: 'Facsimile resize',
          icon: 'format_size',
          styleClass: 'menucus',
          items: [
            {label:'Facsimile size',icon:'add',command:()=>  this.increaseFacsimileSize()
            },
            { label: 'Facsimile size', icon: 'remove',command:()=> this.decreaseFacsimileSize() },
          ]
        },

      /*{ label: 'Gallery', styleClass: 'menucus', icon: 'photo_library',command:()=> {this.openGallery(), this.ngOnDestroy()} },
      /* { label: 'New Window', icon: 'info', styleClass: 'menucus'  },
      /* { label: 'MS Description', icon: 'info', styleClass: 'menucus' ,command:()=> this.openNewWindow()},*/
    /*  { label: 'Fullscreen', styleClass: 'menucus', icon: 'fullscreen' }*/
  ];

    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall]) // Define the breakpoints for small screens
      .pipe(map((result) => result.matches))
      .subscribe((matches) => {
        this.isSmallScreen = matches; // Set the value of 'isSmallScreen' based on the screen size
      });
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
    if (this.allPagesData && this.pageNumber) {
      const pageNumber = parseInt(this.pageNumber,10);
      const currentIndex = this.allPagesData.findIndex(
        (page: { page_number: number }) => page.page_number === pageNumber)
      if (currentIndex !== -1 && currentIndex < this.allPagesData.length - 1) {
        const nextIndex = currentIndex + 1;
        const nextPageLink = this.allPagesData[nextIndex].page_link;
        this.router.navigateByUrl(
          nextPageLink,
          {relativeTo: this.route.parent} as NavigationExtras
        );
      }
    }

  }



  navigateToThePreviousPage() {

    if (this.allPagesData && this.pageNumber) {
      const pageNumber = parseInt(this.pageNumber, 10);
      const currentIndex = this.allPagesData.findIndex(
        (page: { page_number: number }) => page.page_number === pageNumber)

      if (currentIndex !== -1 && currentIndex > 0) {
        const previousIndex = currentIndex - 1;
        const previousPageLink = this.allPagesData[previousIndex].page_link;
        this.router.navigateByUrl(
          previousPageLink,
          {relativeTo: this.route.parent} as NavigationExtras
        );
      }
    }
  }

  openGallery() {

    this.manuscriptChapterPageService.setManuscriptChapterPage(this.manuscriptID,this.chapter,this.pageNumber);
    this.router.navigateByUrl(
      `/manuscripts/${this.manuscriptID}/gallery`,
      { relativeTo: this.route.parent } as NavigationExtras );
  }
  hasSubItems(item: any): boolean {
    return item && item.items && item.items.length > 0;
  }

  increaseFacsimileSize() {
   this.facsimileSize=this.facsimileSize+5; // Replace with the desired size
    this.facsimileService.changeFacsimileSize(this.facsimileSize.toString()+'%');
  }
  decreaseFacsimileSize(){
    this.facsimileSize=this.facsimileSize-5; // Replace with the desired size
    this.facsimileService.changeFacsimileSize(this.facsimileSize.toString()+'%');
  }
  increaseFontSize(): void {
    this.fontSize=this.fontSize+2;
    this.fontSizeService.setFontSize(this.fontSize.toString()+'px');

  }
  decreaseFontSize(){
    this.fontSize=this.fontSize-2;
    this.fontSizeService.setFontSize(this.fontSize.toString()+'px');

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
  }
}

