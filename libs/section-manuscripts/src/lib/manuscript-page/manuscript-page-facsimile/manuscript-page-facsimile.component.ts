import {Component, OnInit,HostListener, Inject, PLATFORM_ID } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { FacsimileService } from "./../../services/manuscript-data.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'kalila-edition-manuscript-page-facsimile',
  templateUrl: './manuscript-page-facsimile.component.html',
  styleUrls: ['./manuscript-page-facsimile.component.scss'],
})
export class ManuscriptPageFacsimileComponent implements OnInit{

  facsimile: any;
  facsimileSize = '65%';
  pageData$!: Observable<any>;

  // Default size

  constructor(
    private route: ActivatedRoute,
    private facsimileService: FacsimileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {

    this.pageData$ = this.route.data.pipe(
      map(data => data)
    );
    if (isPlatformBrowser(this.platformId)) {
      this.updateFacsimileSize(window.innerWidth);
    }
    this.route.data.subscribe(data => {
      const { pageData, unitsData } = data;
      this.facsimile = pageData.imageUrl;

    });


    this.facsimileService.facsimileSize$.subscribe((size: string) => {
      this.facsimileSize = size;
    });


  }
  private updateFacsimileSize(innerWidth: number): void {
    if (innerWidth >= 896) {
      this.facsimileSize = '60%';
    } else {
      this.facsimileSize = '40%';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    // Update the value when the window is resized
    this.updateFacsimileSize((event.target as Window).innerWidth);
  }
}
