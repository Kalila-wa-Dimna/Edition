import { HttpClient } from '@angular/common/http';
import {Component, Inject} from '@angular/core';
import { CONFIG_TOKEN, IConfig } from '../../../config.module';

interface IManuscriptsDescriptionInfo{
  displa:string,
  siglum: string,
  images: string[]
}
@Component({
    selector: 'kd-manuscript-descrition-panel',
    templateUrl: './manuscript-description-panel.component.html',
    styleUrls: ['./manuscript-description-panel.component.css'],
    standalone: false
})
export class ManuscriptDescriptionPanelComponent {
  constructor(private httpClient: HttpClient,  @Inject(CONFIG_TOKEN) private config: IConfig) {}

  data$ = this.httpClient.get<IManuscriptsDescriptionInfo[]>(
    `${this.config.dataEndPoint}manuscripts_description/overview.json`
  );
}
