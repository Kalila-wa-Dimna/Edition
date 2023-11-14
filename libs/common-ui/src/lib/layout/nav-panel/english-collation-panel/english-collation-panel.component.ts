import { Component, ElementRef, Inject, OnInit, OnDestroy } from '@angular/core';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { catchError, filter, map } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { retryWhen, delay, take } from 'rxjs/operators';
import { Subject, Subscription, of, Observable, combineLatest, startWith, switchMap } from "rxjs";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'kalila-edition-english-collation-panel',
  templateUrl: './english-collation-panel.component.html',
  styleUrls: ['./english-collation-panel.component.scss'],
})
export class EnglishCollationPanelComponent implements OnInit {
  siglumSubject = new Subject<string>();
  data: any[] = [];
  filterFormControl = new FormControl('');
  allManuscripts$!: Observable<any[]>;
  englishPagesInMcChapter$!: Observable<any[]>;
  private dataSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private el: ElementRef
  ) { }

  ngOnInit() {
    this.allManuscripts$ = this.httpClient
      .get<any[]>(`${this.config.dataEndPoint}manuscripts/englishAll.json`)
      .pipe(
        retryWhen((errors) =>
          errors.pipe(delay(1000), take(3)) // Retry 3 times with a 1-second delay
        ),
        catchError((error) => {
          console.error('Error fetching manuscripts:', error);
          throw error; // Re-throw the error for the component to handle
        })
      );

    this.englishPagesInMcChapter$ = this.allManuscripts$.pipe(
      switchMap((manuscripts) =>
        combineLatest(
          manuscripts.map((manuscript, index) =>
            this.httpClient.get<any[]>(
              `${this.config.dataEndPoint}manuscripts/${manuscript.siglum}/allEnglishPages.json`
            )
          )
        )
      )
    );

  }

}
