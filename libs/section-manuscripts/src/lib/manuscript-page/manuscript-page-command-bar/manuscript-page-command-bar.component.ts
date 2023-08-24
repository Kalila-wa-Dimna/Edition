import {Component, OnInit, OnDestroy,ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { Router,NavigationExtras,ActivatedRoute } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { FacsimileService } from "./../../services/manuscript-data.service";
import { FontSizeService } from "./../../services/font-size.service";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map} from 'rxjs/operators';

import { Observable ,combineLatest} from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import {IManuscriptInfo} from "../../models/manuscript-summary.model";
import { ManuscriptPageService } from "./../../services/manuscript-page.resolver";
@Component({
  selector: 'kalila-edition-manuscript-page-command-bar',
  templateUrl: './manuscript-page-command-bar.component.html',
  styleUrls: ['./manuscript-page-command-bar.component.scss'],
})
export class ManuscriptPageCommandBarComponent implements OnInit{
  @ViewChild('subMenu') subMenu: MatMenuTrigger | undefined;
  items!: any[];
  isSmallScreen!: boolean;
  fontSize=15;
  facsimileSize=65;
  manuscriptID='';
  chapter='';
  pageNumber='';
  activeSubMenu: any;
  manuscriptsData:IManuscriptInfo[] = [];
  data='';
  commandBarData$! : Observable<any>;
  combinedData$!: Observable<any>;
  constructor( private manuscriptPageService: ManuscriptPageService, private cdr: ChangeDetectorRef, private route: ActivatedRoute,private router: Router, private facsimileService: FacsimileService, private fontSizeService:FontSizeService,private breakpointObserver: BreakpointObserver) {
  this.fontSizeService.setFontSize('15px');
  }
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '';
      const chapter = params.get('chapter') || '';
      const pageNumber = params.get('pageNumber') || '';
      this.combinedData$ = combineLatest([
        this.manuscriptPageService.fetchData(id, chapter, pageNumber)]);
      this.manuscriptID = id;
      this.chapter = chapter;
      this.pageNumber = pageNumber;

    });

    this.items =   [
      {
        label:this.manuscriptID.toString(), icon: 'book'

      },
      {
        label: 'Select MS',
        icon: 'book',
        styleClass: 'menucus',
        items: [
          { label: 'Pococke 400', icon: 'book',command: () => this.navigateToTheSelectedManuscript('P400')},
          { label: 'Parker 578', icon: 'book',command: () => this.navigateToTheSelectedManuscript('P578') },
          { label: 'Paris 5881', icon: 'book',command: () => this.navigateToTheSelectedManuscript('P5881') },
          { label: 'Paris 3465', icon: 'book',command: () => this.navigateToTheSelectedManuscript('P3465') },
          { label: 'Paris 3466', icon: 'book',command: () => this.navigateToTheSelectedManuscript('P3466') },
          { label: 'Ayasofya 4095', icon: 'book' ,command: () => this.navigateToTheSelectedManuscript('A4095')},
          { label: 'Paris 3471', icon: 'book',command: () => this.navigateToTheSelectedManuscript('P3471') },
          { label: 'Paris 3475', icon: 'book',command: () => this.navigateToTheSelectedManuscript('P3475') },
          { label: 'Paris 2789', icon: 'book',command: () => this.navigateToTheSelectedManuscript('P2789') },
          { label: 'Paris 3473', icon: 'book',command: () => this.navigateToTheSelectedManuscript('P3473') },
        ]
      },
      {
        label: 'Select page',
        icon: 'description',
        styleClass: 'menucus',
      },
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
      { label: 'Gallery', styleClass: 'menucus', icon: 'photo_library',command:()=> this.openGallery() },
      { label: 'Facsimile', styleClass: 'menucus', icon: 'image' },
      { label: 'MS Description', icon: 'info', styleClass: 'menucus' },
      { label: 'Fullscreen', styleClass: 'menucus', icon: 'fullscreen' }
  ];
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall]) // Define the breakpoints for small screens
      .pipe(map((result) => result.matches))
      .subscribe((matches) => {
        this.isSmallScreen = matches; // Set the value of 'isSmallScreen' based on the screen size
      });
  }
  navigateToTheSelectedManuscript(label: string) {
    this.route.params.subscribe(params => {
      const id = params['id'];
      const chapter = params['chapter'];
      const pageNumber = params['pageNumber'];

      const targetUrlSegments = ['manuscripts', label, chapter, pageNumber];
      this.router.navigateByUrl(`/manuscripts/${label}/${chapter}/${pageNumber}`,
        { relativeTo: this.route.parent } as NavigationExtras );
    });

  }
  openGallery() {
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

}
