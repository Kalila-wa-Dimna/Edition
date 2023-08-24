import { Component,OnInit } from '@angular/core';
import {IGalleryInfo} from "../../models/manuscript-summary.model";
import {ActivatedRoute} from "@angular/router";
import { ImageListItem } from '../../models/manuscript-summary.model';
@Component({
  selector: 'kalila-edition-manuscript-page-gallery-viewer',
  templateUrl: './manuscript-page-gallery-viewer.component.html',
  styleUrls: ['./manuscript-page-gallery-viewer.component.scss']
})
export class ManuscriptPageGalleryViewerComponent implements OnInit {
  data:IGalleryInfo[] = [];
  IMAGES:ImageListItem[]=[];
  getPics(){
     let i=0;
    i=i+1;
  }

  constructor(private route: ActivatedRoute) {
  }
  ngOnInit() {
    this.data = this.route.snapshot.data['galleryData'];

  }
}
