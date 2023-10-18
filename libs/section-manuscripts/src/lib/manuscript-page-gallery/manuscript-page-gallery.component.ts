import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { IGalleryInfo } from '../models/manuscript-summary.model';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, Observable, Subscription} from "rxjs";
import { switchMap } from 'rxjs/operators';
import {ManuscriptPageService} from "../services/manuscript-page.resolver";
@Component({
  selector: 'kalila-edition-manuscript-page-gallery',
  templateUrl: './manuscript-page-gallery.component.html',
  styleUrls: ['./manuscript-page-gallery.component.scss'],
})
export class ManuscriptPageGalleryComponent implements OnInit, OnDestroy  {

  combinedData$!: Observable<any>;
  data:any;
  sub?: Subscription;
  manuscriptID='';
  chapter='';
  pageNumber='';
  constructor( private manuscriptPageService: ManuscriptPageService, private cdr: ChangeDetectorRef, private route: ActivatedRoute,private router: Router) {

  }
  ngOnInit(){
    this.data=this.route.snapshot.data;
    console.log(this.data)

    this.sub =this.route.paramMap.subscribe(params => {
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
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
