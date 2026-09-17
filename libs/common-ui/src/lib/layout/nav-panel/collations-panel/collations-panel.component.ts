import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { CONFIG_TOKEN, IConfig } from '../../../config.module';

interface ICollationInfo {
  display: string;
  siglum: string;
  key?: string;
  image: string;
}

@Component({
  selector: 'kd-collations-panel',
  templateUrl: './collations-panel.component.html',
  styleUrls: ['./collations-panel.component.scss'],
  standalone: false,
})
export class CollationsPanelComponent {
  constructor(
    private httpClient: HttpClient,
    @Inject(CONFIG_TOKEN) private config: IConfig
  ) {}

  data$ = this.httpClient
    .get<ICollationInfo[]>(`${this.config.dataEndPoint}collations/all.json`)
    .pipe(
      map((items) =>
        items.map((item) => ({
          ...item,
          key: item.key || item.siglum,
        }))
      )
    );
}
