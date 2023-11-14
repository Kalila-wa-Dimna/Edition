import { HttpClient } from '@angular/common/http';
import { Component, Inject, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import {
  map,
  withLatestFrom,
  startWith,
  Observable,
  of,
  combineLatest,
  switchMap,
  takeUntil,
  Subject
} from 'rxjs';

@Component({
  selector: 'kd-manuscripts-panel',
  templateUrl: './manuscripts-panel.component.html',
  styleUrls: ['./manuscripts-panel.component.scss'],
})
export class ManuscriptsPanelComponent {
  filterFormControl = new FormControl('');
  siglumSubject = new Subject<string>();
  allManuscripts$: Observable<any[]> = combineLatest([
    this.httpClient.get<any[]>(
      `${this.config.dataEndPoint}manuscripts/all.json`
    ),
    this.filterFormControl.valueChanges.pipe(startWith('')),
    this.siglumSubject.asObservable().pipe(startWith('')),
  ]).pipe(
    map(([data, filter, siglum]) => {
      if (filter && filter.length !== 0) {
        return data.filter((item) =>
          item.siglum.toLowerCase().includes(filter.toLocaleLowerCase())
        );
      }
      if (siglum && siglum.length !== 0) {
        return data.filter((item) =>
          item.siglum.toLowerCase().includes(siglum.toLocaleLowerCase())
        );
      }
      return data;
    })
  );

  selectedIndex$ = combineLatest([this.allManuscripts$, this.route.data]).pipe(
    map(([all, data]) => {
      const current =
        data && data['pageData'] && data['pageData']['manuscript'];
      if (current) {
        const index = all.findIndex((item) => item.siglum === current);
        if (index !== -1) {
          return [index, current];
        }
      }
      return [0, null];
    })
  );
  galleryData$ = combineLatest([this.route.data]).pipe(
  )

  manuscriptChapters$ = this.allManuscripts$.pipe(
    switchMap((manuscripts) =>
      combineLatest(
        manuscripts.map((manuscript, index) =>
          this.httpClient.get<any[]>(
            `${this.config.dataEndPoint}manuscripts/${manuscript.siglum}/allChapters.json`
          )
        )
      )
    )
  );

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private el: ElementRef
  ) {

  }


}

