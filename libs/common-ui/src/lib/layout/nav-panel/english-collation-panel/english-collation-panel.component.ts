import { Component, ElementRef, Inject } from '@angular/core';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Subject, combineLatest, switchMap } from "rxjs";
import { FormControl } from "@angular/forms";

export interface IEnglishPageInfo {
  display: string;
  siglum: string;
  image: string;
  first_chapter: string,
  first_page: string,
}

@Component({
    selector: 'kd-english-collation-panel',
    templateUrl: './english-collation-panel.component.html',
    styleUrls: ['./english-collation-panel.component.scss'],
    standalone: false
})
export class EnglishCollationPanelComponent {


  constructor(
    private httpClient: HttpClient,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) { }
  siglumSubject = new Subject<string>();
  filterFormControl = new FormControl('');

  allManuscripts$ = this.httpClient
    .get<IEnglishPageInfo[]>(`${this.config.dataEndPoint}manuscripts/englishAll.json`)


  englishPagesInMcChapter$ = this.allManuscripts$.pipe(
    switchMap((manuscripts) =>
      combineLatest(
        manuscripts.map((manuscript) =>
          this.httpClient.get<any[]>(
            `${this.config.dataEndPoint}manuscripts/${manuscript.siglum}/allEnglishPages.json`
          )
        )
      )
    )
  );



}
