import {Component, OnInit, ViewEncapsulation,OnDestroy, VERSION, ViewChild, ElementRef, Inject, PLATFORM_ID} from '@angular/core';
import {IGalleryInfo} from "../../models/manuscript-summary.model";
import {ActivatedRoute} from "@angular/router";
import { ImageListItem } from '../../models/manuscript-summary.model';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { LightGallery } from 'lightgallery/lightgallery';
import {CONFIG_TOKEN, IConfig} from "@kalila-edition/common-ui";
import { isPlatformBrowser } from '@angular/common';
import {Subscription} from "rxjs";
import * as lightGallery from 'lightgallery';

@Component({
  selector: 'kalila-edition-manuscript-page-gallery-viewer',
  templateUrl: './manuscript-page-gallery-viewer.component.html',
  styleUrls: ['./manuscript-page-gallery-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManuscriptPageGalleryViewerComponent implements OnInit, OnDestroy {



  data:IGalleryInfo[] = [];
  IMAGES:ImageListItem[]=[];
  size='1400-933';
  pagesEndPoint = this.config.imagesEndPoint + 'pages/';

  sub?: Subscription;
  private needRefresh = false;

  isBrowser:boolean=false;
  private lightGallery!: LightGallery;
  settings = {
    plugins: [ lgThumbnail],

  };

  getPics(){
     let i=0;
    i=i+1;
  }

  constructor( private route: ActivatedRoute, private _elementRef: ElementRef,@Inject(CONFIG_TOKEN) private config: IConfig,  @Inject(PLATFORM_ID) private platformId: Object ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this._elementRef = _elementRef;
  }
  ngOnInit() {
    this.data = this.route.snapshot.data['galleryData'];
    this.sub = this.route.data.subscribe(data => {
      this.data = data['galleryData'].map((item: IGalleryInfo) => ({
        ...item,
        src: this.pagesEndPoint + item.src,
        thumb: this.pagesEndPoint + item.thumb
      }));
    });


  }

  ngAfterViewChecked(): void {
    if (this.needRefresh) {
      this.lightGallery.refresh(this.data);
      this.lightGallery.openGallery();
      this.lightGallery.refresh();
      this.needRefresh = false;
    }
  }
  onInit = (detail:any): void => {
    this.lightGallery = detail.instance;
    this.lightGallery.plugins.push();
    this.lightGallery.refresh();
    // Refresh and open gallery
  };


  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.lightGallery) {
      // Close the gallery when the component is destroyed
      this.lightGallery.closeGallery();
    }
  }


}

