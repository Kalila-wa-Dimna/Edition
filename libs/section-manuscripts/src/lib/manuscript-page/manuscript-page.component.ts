import {ChangeDetectorRef, Component, OnInit, OnDestroy, PLATFORM_ID, Inject} from '@angular/core';
import {ManuscriptPageService} from "../services/manuscript-page.resolver";
import {ActivatedRoute,  Router} from "@angular/router";
import {combineLatest, Observable, Subscription} from "rxjs";
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'kalila-edition-manuscript-page',
  templateUrl: './manuscript-page.component.html',
  styleUrls: ['./manuscript-page.component.scss'],
})
export class ManuscriptPageComponent  implements OnInit, OnDestroy {
  combinedData$!: Observable<any>;
  data:any;
  sub?: Subscription;
  manuscriptID='';
  chapter='';
  pageNumber='';

  constructor(
    private manuscriptPageService: ManuscriptPageService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object)
  {

  }
  ngOnInit(){
    if (isPlatformBrowser(this.platformId)) {
      this.data = this.route.snapshot.data;
      this.sub = this.route.paramMap.subscribe(params => {
        const id = params.get('id') || '';
        const chapter = params.get('chapter') || '';
        const pageNumber = params.get('pageNumber') || '';
        this.combinedData$ = combineLatest([
          this.manuscriptPageService.fetchData(id, chapter, pageNumber)]);
        this.manuscriptID = id;
        this.chapter = chapter;
        this.pageNumber = pageNumber;
      });
   }
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  }
