import {Component, Inject, OnInit} from '@angular/core';
import { ICollationInfo } from '../../models/collation-summary.model';
import { ActivatedRoute } from '@angular/router';
import {CONFIG_TOKEN, IConfig} from "@kalila-edition/common-ui";

@Component({
  selector: 'kd-select-collation',
  templateUrl: './select-collation.component.html',
  styleUrls: ['./select-collation.component.scss'],
})
export class SelectCollationComponent implements OnInit {
  data: ICollationInfo[] = [];

  imageEndPoint = this.config.imagesEndPoint + "collations/"
  constructor(private route: ActivatedRoute, @Inject(CONFIG_TOKEN) private config: IConfig) {}

  cols = 2;
  ngOnInit() {
    this.data = this.route.snapshot.data['collationsList'];
  }
}
