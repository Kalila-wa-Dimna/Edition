import {Component, OnInit, OnDestroy,ViewChild} from '@angular/core';
import { Router,NavigationExtras,ActivatedRoute } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import {ManuscriptChapterPageService} from "./../../services/manuscript-chapter-page.service";
import {Subscription} from "rxjs";
import {IManuscriptInfo} from "../../models/manuscript-summary.model";
@Component({
  selector: 'kalila-edition-manuscript-page-gallery-command-bar',
  templateUrl: './manuscript-page-gallery-command-bar.component.html',
  styleUrls: ['./manuscript-page-gallery-command-bar.component.scss'],
})
export class ManuscriptPageGalleryCommandBarComponent implements OnDestroy{
  items!: any[];
  manuscriptID:string="";
  id:string="";
  chapter:string="";
  page:string="";
  dataMs:any;
  sub?: Subscription;
  manuscriptsData:any;
  manuscriptsInfo:any;
  constructor(private route: ActivatedRoute, private router: Router, private manuscriptChapterPageService:ManuscriptChapterPageService ,) {
    const { manuscript, chapter, page } = manuscriptChapterPageService.getManuscriptChapterPage();
    this.manuscriptID = manuscript;
    this.chapter = chapter;
    this.page = page;
    console.log(this.manuscriptID,this.chapter,this.page,"hi");
    this.manuscriptsData=this.route.snapshot.data;
    this.manuscriptsInfo=this.manuscriptsData.manuscriptsInfo

    this.sub =this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '';
      this.id=id;
    });
  }

  ngOnInit() {

    console.log(this.route.snapshot.data)
    this.items = [
      {
        label: 'Select MS',
        icon: 'book',
        styleClass: 'menucus',
        items: [
          {label: 'Pococke 400', icon: 'book'},
          {label: 'Parker 578', icon: 'book'},
          {label: 'Paris 5881', icon: 'book'},
          {label: 'Paris 3465', icon: 'book'},
          {label: 'Paris 3466', icon: 'book'},
          {label: 'Ayasofya 4095', icon: 'book'},
          {label: 'Paris 3471', icon: 'book'},
          {label: 'Paris 3475', icon: 'book'},
          {label: 'Paris 2789', icon: 'book'},
          {label: 'Paris 3473', icon: 'book'},
        ]
      },
      {label: 'Facsimile-Text', styleClass: 'menucus', icon: 'insert_drive_file',command:()=> this.navigateToFacsimileText()},
     /* {label: 'MS Description', icon: 'info', styleClass: 'menucus'},
      {label: 'Fullscreen', styleClass: 'menucus', icon: 'fullscreen'}*/
    ];
  }

  hasSubItems(item: any): boolean {
    return item && item.items && item.items.length > 0;
  }

  navigateToFacsimileText() {
    let manuscriptId = this.manuscriptID;
    let chapter = this.chapter;
    let page = this.page;

    // Check if any of the values are empty and assign default values if needed
    if (manuscriptId === '' || chapter === '' || page === '') {
      manuscriptId = this.id;

      const idToSearch = "P5881"; // Replace with the ID you want to search for
      const result = this.getFirstChapterAndPage(this.id, this.manuscriptsInfo);

      if (result) {
        chapter = result.chapter; // Update chapter
        page = result.page; // Update page
        console.log(`First Chapter: ${chapter}, First Page: ${page}`);
      } else {
        console.log(`No matching entry found for ID: ${idToSearch}`);
      }
    }

    this.router.navigateByUrl(
      `/manuscripts/${manuscriptId}/${chapter}/${page}`,
      { relativeTo: this.route.parent } as NavigationExtras
    );
  }

   getFirstChapterAndPage(id: string, manuscriptsData: any[]): { chapter: string, page: string } | null {
    console.log(this.manuscriptsData,"2222")
    const entry = manuscriptsData.find((manuscript) => manuscript.siglum.toLowerCase() === id.toLowerCase());

    if (entry) {
      return {
        chapter: entry.first_chapter,
        page: entry.first_page,
      };
    } else {
      return null; // Return null if no matching entry is found
    }
  }


  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}
