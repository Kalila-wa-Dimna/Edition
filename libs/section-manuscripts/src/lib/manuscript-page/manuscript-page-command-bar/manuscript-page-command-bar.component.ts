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
  Output, EventEmitter
} from '@angular/core';
import { Router,NavigationExtras,ActivatedRoute } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { FacsimileService } from "./../../services/manuscript-data.service";
import { FontSizeService } from "./../../services/font-size.service";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map} from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import {Observable, combineLatest, Subscription} from 'rxjs';
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

  private navigationInProgress = false;
  currentPageIndex=0;
  @Output() closeClicked = new EventEmitter();
  constructor( private manuscriptChapterPageService:ManuscriptChapterPageService,private el: ElementRef,private renderer: Renderer2, private manuscriptPageService: ManuscriptPageService, private cdr: ChangeDetectorRef, public route: ActivatedRoute,private router: Router, private facsimileService: FacsimileService, private fontSizeService:FontSizeService,private breakpointObserver: BreakpointObserver) {
  this.fontSizeService.setFontSize('15px');

  this.sub = this.route.params.subscribe((params) => {
      const id = params['id']  || '';
      const chapter =params['chapter'] || '';
      const pageNumber = params['pageNumber'] || '';

      console.log(id,chapter,pageNumber,'llxlsklllxlxlxlxlxlxlx')
      // Update the this.pageNumber property with the current route parameter
      this.pageNumber = pageNumber;

      // You can also update other properties if needed
      this.manuscriptID = id;
      this.chapter = chapter;

      // Rest of your code here
    },
    (error) => {
      console.error('Route params subscription error:', error);
    }
    );
  }

  ngOnInit() {
      this.data=this.route.snapshot.data;
      this.route.data.subscribe(data => {
        const { pageData, unitsData, allChaptersData, manuscriptChaptersData,allPagesData } = data;
        // Now you can access each resolved data object
        this.pageData = pageData;
        this.unitsData = unitsData;
        this.allChaptersData= allChaptersData;
        this.manuscriptChapters=manuscriptChaptersData;
        this.allPagesData=allPagesData;
        this.currentPageIndex=this.allPagesData[0].index;
        console.log(this.pageData, 'Page Data');
        console.log(this.unitsData, 'Units Data');
        console.log(this.allChaptersData, 'Chapter Data');
        console.log(this.allPagesData, 'all pages Data');
        console.log(this.currentPageIndex,'current Page Index')

      });



    this.items =   [
      {
        label: 'Select MS',
        icon: 'book',
        styleClass: 'menucus',
        items: [
          { label: 'Pococke 400', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P400'),this.ngOnDestroy()}},
          { label: 'Parker 578', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P578')}},
          { label: 'Paris 5881', icon: 'book',command: () =>{ this.navigateToTheSelectedManuscript('P5881'),this.ngOnDestroy()} },
          { label: 'Paris 3465', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P3465')} },
          { label: 'Paris 3466', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P3466')}},
          { label: 'Ayasofya 4095', icon: 'book' ,command: () => {this.navigateToTheSelectedManuscript('A4095')}},
          { label: 'Paris 3471', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P3471')}},
          { label: 'Paris 3475', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P3475')} },
          { label: 'Paris 2789', icon: 'book',command: () => {this.navigateToTheSelectedManuscript('P2789')}},
          { label: 'Paris 3473', icon: 'book',command: () =>{ this.navigateToTheSelectedManuscript('P3473')} },
        ]
      },
      {
        label: 'Select page',
        icon: 'description',
        styleClass: 'menucus',
        command:() => this.openNavbar(),
      },
      { label: 'Prev',  icon:'arrow_back_ios_new' ,command:()=> {this.navigateToThePreviousPage(), this.ngOnDestroy()}},
      { label: ' ',  icon:' '},

      { label: 'Next',  icon: 'arrow_forward_ios', command:()=> {this.navigateToTheNextPage(), this.ngOnDestroy()}},

      {
        label: 'Resize',
        icon: 'format_size',
        styleClass: 'menucus',
        items: [
          { label: 'Font size', icon: 'add', command: () => this.increaseFontSize()
          },
          { label: 'Font size', icon: 'remove',command:() => this.decreaseFontSize()
          },
          {label:'Facsimile size',icon:'add',command:()=>  this.increaseFacsimileSize()
          },
          { label: 'Facsimile size', icon: 'remove',command:()=> this.decreaseFacsimileSize() },
        ]
      },
      { label: 'Gallery', styleClass: 'menucus', icon: 'photo_library',command:()=> {this.openGallery(), this.ngOnDestroy()} },
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

  async navigateToTheSelectedManuscript(manuscriptId: string) {

      const chapter = this.chapter // Use snapshot to get the current value

        // Assuming getFirstPageForChapter is an asynchronous function
        const pageNumber = await this.getFirstPageForChapter(chapter.toString(),manuscriptId.toString());
        await this.router.navigateByUrl(
          `/manuscripts/${manuscriptId}/${chapter}/${pageNumber}`,
          { relativeTo: this.route.parent } as NavigationExtras
        );


  }


  getFirstPageForChapter(chapterName: string, manuscriptId: string): string | null {
    const chapterEntry = this.allChaptersData.find(entry =>
      entry.manuscript.toLowerCase() === manuscriptId.toLowerCase() &&
      entry.chapter.toLowerCase() === chapterName.toLowerCase()
    );

    console.log('Searching for:', chapterName, 'in manuscript:', manuscriptId);
    console.log('Matching entry:', chapterEntry);

    if (chapterEntry) {
      console.log('Found entry. First page:', chapterEntry['first-page']);
      return chapterEntry['first-page'];
    } else {
      console.log('Entry not found.');
      return null; // Chapter not found
    }
  }


  navigateToTheNextPage(): void {

    this.sub = this.route.params.subscribe(params => {
      //  const id = params['id'];
      // const chapter = params['chapter'];
      const pageNumber = params['pageNumber'];
      console.log(pageNumber)
      console.log(this.allPagesData,'alllllll');
      const currentIndex = this.allPagesData.findIndex(
        (page: { page_number: string }) => page.page_number === pageNumber)
      console.log(pageNumber, currentIndex,'jjkkppüpüüüü');
      if (currentIndex !== -1 && currentIndex < this.allPagesData.length - 1) {
        const nextIndex = currentIndex + 1;
        const nextPageLink = this.allPagesData[nextIndex].page_link;
        console.log(nextPageLink);
        this.router.navigateByUrl(
          nextPageLink,
          {relativeTo: this.route.parent} as NavigationExtras
        );
      }
    });
  }



  navigateToThePreviousPage(){

    this.sub = this.route.params.subscribe(params => {
      //  const id = params['id'];
      // const chapter = params['chapter'];
      const pageNumber = params['pageNumber'];
      console.log(pageNumber)
      console.log(this.allPagesData, 'alllllll');
      const currentIndex = this.allPagesData.findIndex(
        (page: { page_number: string }) => page.page_number === pageNumber)
      console.log(pageNumber, currentIndex, 'jjkkppüpüüüü');

      if (currentIndex !== -1 && currentIndex > 0) {
        const previousIndex = currentIndex - 1;
        const previousPageLink = this.allPagesData[previousIndex].page_link;
        this.router.navigateByUrl(
          previousPageLink,
          {relativeTo: this.route.parent} as NavigationExtras
        );
      }
    });
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
  /*openNewWindow() {
    const element = this.el.nativeElement.querySelector('.original-toolbar');

    if (element) {
      // Set the element's width to 50%
      this.renderer.setStyle(element, 'width', '50%');

      // Set the element to display as flex container
      this.renderer.setStyle(element, 'display', 'flex');

      this.renderer.setStyle(element, 'flex-wrap', 'wrap');
      this.renderer.setStyle(element, 'position', 'relative');

      // You can also specify other flex properties if needed
    }

  }*/

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

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
