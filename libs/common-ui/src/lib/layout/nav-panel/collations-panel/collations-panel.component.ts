import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

interface ICollationInfo {
  display: string;
  siglum: string;
  image: string;
}

@Component({
  selector: 'kd-collations-panel',
  templateUrl: './collations-panel.component.html',
  styleUrls: ['./collations-panel.component.scss'],
})
export class CollationsPanelComponent {
  constructor(private httpClient: HttpClient) {}

  data$ = this.httpClient.get<ICollationInfo[]>(
    '/assets/data/collations/all.json'
  );
}
