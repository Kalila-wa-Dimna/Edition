import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { IManuscriptInfo } from '../models/manuscript-summary.model';

@Component({
  selector: 'kalila-edition-select-manuscript',
  templateUrl: './select-manuscript.component.html',
  styleUrls: ['./select-manuscript.component.scss'],
})
export class SelectManuscriptComponent implements OnInit{
  data:IManuscriptInfo[] = [];
    constructor(private route: ActivatedRoute) {
  }
  ngOnInit() {
    this.data = this.route.snapshot.data['manuscriptList'];
    console.log(this.data)
  }
}
