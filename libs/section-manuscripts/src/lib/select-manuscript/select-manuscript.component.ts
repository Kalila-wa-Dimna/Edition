import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { IManuscriptInfo } from '../models/manuscript-summary.model';
import {CONFIG_TOKEN, IConfig} from "@kalila-edition/common-ui";

@Component({
  selector: 'kalila-edition-select-manuscript',
  templateUrl: './select-manuscript.component.html',
  styleUrls: ['./select-manuscript.component.scss'],
})
export class SelectManuscriptComponent implements OnInit{
  data:IManuscriptInfo[] = [];

  imageEndpoint = this.config.imagesEndPoint + "manuscripts/";
    constructor(private route: ActivatedRoute,  @Inject(CONFIG_TOKEN) private config: IConfig) {
  }
  ngOnInit() {
    this.data = this.route.snapshot.data['manuscriptList'];
    console.log(this.data)
  }
}
