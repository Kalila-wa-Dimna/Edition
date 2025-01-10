import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { debounceTime, filter, map } from 'rxjs/operators';
import { ManuscriptChapterPageService } from "./../../services/manuscript-chapter-page.service";
import { Subscription } from "rxjs";
import { IManuscriptInfo } from "../../models/manuscript-summary.model";
@Component({
    selector: 'kalila-edition-manuscript-page-gallery-command-bar',
    templateUrl: './manuscript-page-gallery-command-bar.component.html',
    styleUrls: ['./manuscript-page-gallery-command-bar.component.scss'],
    standalone: false
})
export class ManuscriptPageGalleryCommandBarComponent implements OnDestroy {
  items!: any[];
  manuscriptID: string = "";
  id: string = "";
  chapter: string = "";
  page: string = "";
  dataMs: any;
  sub?: Subscription;
  manuscriptsData: any;
  manuscriptsInfo: IManuscriptInfo[] = [];
  selecterGallery: string = '';
  constructor(private route: ActivatedRoute, private router: Router, private manuscriptChapterPageService: ManuscriptChapterPageService,) {
    const { manuscript, chapter, page } = manuscriptChapterPageService.getManuscriptChapterPage();

    this.manuscriptID = manuscript;
    this.chapter = chapter;
    this.page = page;
  }



  ngOnInit() {


    this.sub = this.router.events
      .pipe(
        debounceTime(50)
      )
      .subscribe(() => {
        this.selecterGallery = '';
        const id = this.route.snapshot.paramMap.get('id') || '';
        // Update your data properties here
        this.selecterGallery = id;
        // Check if id is different from the current manuscript
        // Assuming manuscriptsInfo is resolved from route data
        const manuscriptsData = this.route.snapshot.data;
        this.manuscriptsInfo = manuscriptsData['manuscriptsInfo'];
      });
    this.items = [
      /*{
        label: 'Select MS',
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
      {label: 'Facsimile-Transcription', styleClass: 'menucus', icon: 'insert_drive_file',command:()=> this.navigateToFacsimileText()},
*/
    ];
  }

  hasSubItems(item: any): boolean {
    return item && item.items && item.items.length > 0;
  }

  navigateToFacsimileText() {
    let manuscriptId = this.manuscriptID;
    let chapter = this.chapter;
    let page = this.page;
    if (this.selecterGallery !== this.manuscriptID) {
      // Find the manuscript data by matching siglum to id
      const selectedManuscript = this.manuscriptsInfo.find(manuscript => manuscript.siglum === this.selecterGallery);

      // Check if a matching manuscript was found
      if (selectedManuscript) {
        // Set the values in your service
        this.manuscriptChapterPageService.setManuscriptChapterPage(selectedManuscript.siglum, selectedManuscript.first_chapter, selectedManuscript.first_page);
        const { manuscript, chapter, page } = this.manuscriptChapterPageService.getManuscriptChapterPage();

        this.manuscriptID = manuscript;
        this.chapter = chapter;
        this.page = page;
      }
      this.router.navigateByUrl(
        `/manuscripts/${this.manuscriptID}/${this.chapter}/${this.page}`,
        { relativeTo: this.route.parent } as NavigationExtras
      );
    }
    // Check if any of the values are empty and assign default values if needed
    /* */
    else if (manuscriptId === '' || chapter === '' || page === '') {
      manuscriptId = this.id;

      const idToSearch = "P5881"; // Replace with the ID you want to search for
      const result = this.getFirstChapterAndPage(this.id, this.manuscriptsInfo);

      if (result) {
        chapter = result.chapter; // Update chapter
        page = result.page; // Update page
      } else {
      }
    }
    else {
      this.router.navigateByUrl(
        `/manuscripts/${manuscriptId}/${chapter}/${page}`,
        { relativeTo: this.route.parent } as NavigationExtras
      );
    }
  }


  getFirstChapterAndPage(id: string, manuscriptsData: any[]): { chapter: string, page: string } | null {
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
  async navigateToTheSelectedManuscript(manuscriptId: string) {
    // const chapter = this.chapter;
    // The chapter exists in the selected manuscript
    this.router.navigateByUrl(
      `/manuscripts/${manuscriptId}/gallery`,
      { relativeTo: this.route.parent } as NavigationExtras
    );

  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}
