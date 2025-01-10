import { HttpClient } from '@angular/common/http';
import {Component, Inject} from '@angular/core';
import {CONFIG_TOKEN, IConfig} from "@kalila-edition/common-ui";

interface ICollationInfo {
  display: string;
  siglum: string;
  image: string;
}

@Component({
    selector: 'kd-collations-panel',
    templateUrl: './collations-panel.component.html',
    styleUrls: ['./collations-panel.component.scss'],
    standalone: false
})
export class CollationsPanelComponent {
  constructor(private httpClient: HttpClient,  @Inject(CONFIG_TOKEN) private config: IConfig) {}

  data$ = this.httpClient.get<ICollationInfo[]>(
    `${this.config.dataEndPoint}collations/all.json`
  );
}
