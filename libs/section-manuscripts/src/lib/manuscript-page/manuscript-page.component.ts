import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  HostBinding,
} from '@angular/core';
import { ManuscriptPageService } from '../services/manuscript-page.resolver';
import { ActivatedRoute, Data, ParamMap } from '@angular/router';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { ManuscriptViewModeService } from '../services/manuscript-view-mode.service';
import { ManuscriptContentModeService } from '../services/manuscript-content-mode.service';
import { FacsimileService } from '../services/manuscript-data.service';

@Component({
  selector: 'kalila-edition-manuscript-page',
  templateUrl: './manuscript-page.component.html',
  styleUrls: ['./manuscript-page.component.scss'],
  standalone: false,
})
export class ManuscriptPageComponent implements OnInit, OnDestroy {
  combinedData$!: Observable<any>;
  data: any;
  sub1 = Subscription.EMPTY;
  sub2 = Subscription.EMPTY;
  modeSub = Subscription.EMPTY;
  contentSub = Subscription.EMPTY;
  facsimileSub = Subscription.EMPTY;
  manuscriptID = '';
  chapter = '';
  pageNumber = '';
  version = 1763769600000; // our version 0, corresponds to 31.05.2024
  isBothMode = false;
  isContentBoth = false;
  facsimileVisible = true;

  @HostBinding('class.both-mode')
  get bothModeHostClass(): boolean {
    return this.isBothMode || this.isContentBoth;
  }

  @HostBinding('class.facsimile-hidden')
  get facsimileHiddenHostClass(): boolean {
    return !this.facsimileVisible;
  }

  constructor(
    private manuscriptPageService: ManuscriptPageService,
    private route: ActivatedRoute,
    private viewModeService: ManuscriptViewModeService,
    private contentModeService: ManuscriptContentModeService,
    private facsimileService: FacsimileService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.readData(this.route.snapshot.data);
    this.readParams(this.route.snapshot.paramMap);
    this.isBothMode = this.viewModeService.mode === 'both';
    this.isContentBoth = this.contentModeService.mode === 'both';
    this.facsimileVisible = this.facsimileService.visible;

    if (isPlatformBrowser(this.platformId)) {
      this.sub1 = this.route.paramMap.subscribe((params) => {
        this.readParams(params);
      });

      this.sub2 = this.route.data.subscribe((data) => {
        this.readData(data);
      });

      this.modeSub = this.viewModeService.mode$.subscribe((mode) => {
        this.isBothMode = mode === 'both';
      });

      this.contentSub = this.contentModeService.mode$.subscribe((mode) => {
        this.isContentBoth = mode === 'both';
      });

      this.facsimileSub = this.facsimileService.visible$.subscribe((visible) => {
        this.facsimileVisible = visible;
      });
    }
  }

  readData(data: Data) {
    this.data = data;
    this.version = this.data.pageData.version ?? this.version;
    this.pageNumber = this.data.pageData.pageNumber ?? this.pageNumber;
  }

  readParams(params: ParamMap) {
    const id = params.get('id') || '';
    const chapter = params.get('chapter') || '';
    const pageNumber = params.get('pageNumber') || '';
    this.combinedData$ = combineLatest([
      this.manuscriptPageService.fetchData(id, chapter, pageNumber),
    ]);
    this.manuscriptID = id;
    this.chapter = chapter;
    this.pageNumber = pageNumber;
  }

  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.modeSub.unsubscribe();
    this.contentSub.unsubscribe();
    this.facsimileSub.unsubscribe();
  }
}
