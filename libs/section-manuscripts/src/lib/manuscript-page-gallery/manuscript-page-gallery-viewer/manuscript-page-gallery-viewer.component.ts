import { Component,OnInit,ViewEncapsulation,VERSION, ViewChild,ElementRef } from '@angular/core';
import {IGalleryInfo} from "../../models/manuscript-summary.model";
import {ActivatedRoute} from "@angular/router";
import { ImageListItem } from '../../models/manuscript-summary.model';
import lgZoom from 'lightgallery/plugins/zoom';
import { LightGallery } from 'lightgallery/lightgallery';

@Component({
  selector: 'kalila-edition-manuscript-page-gallery-viewer',
  templateUrl: './manuscript-page-gallery-viewer.component.html',
  styleUrls: ['./manuscript-page-gallery-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManuscriptPageGalleryViewerComponent implements OnInit {


  data:IGalleryInfo[] = [];
  IMAGES:ImageListItem[]=[];
  size='1400-933';

  private lightGallery!: LightGallery;
  settings = {
    counter: false,
    plugins: [lgZoom],
    lgZoom: true,
    zoomFromOrigin: true,
  };
  getPics(){
     let i=0;
    i=i+1;
  }

  constructor(private route: ActivatedRoute) {
  }
  ngOnInit() {
    this.data = this.route.snapshot.data['galleryData'];
  }

  onInit = (detail:any): void => {
    this.lightGallery = detail.instance;
  };
}

