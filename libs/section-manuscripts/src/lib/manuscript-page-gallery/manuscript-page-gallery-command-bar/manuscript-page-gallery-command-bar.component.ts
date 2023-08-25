import {Component, OnInit, OnDestroy,ViewChild} from '@angular/core';
import { Router,NavigationExtras,ActivatedRoute } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
@Component({
  selector: 'kalila-edition-manuscript-page-gallery-command-bar',
  templateUrl: './manuscript-page-gallery-command-bar.component.html',
  styleUrls: ['./manuscript-page-gallery-command-bar.component.scss'],
})
export class ManuscriptPageGalleryCommandBarComponent {
  items!: any[];


  constructor(private route: ActivatedRoute, private router: Router) {

  }

  ngOnInit() {

    console.log(this.route.snapshot.data)
    this.items = [
      {
        label: 'Select MS',
        icon: 'book',
        styleClass: 'menucus',
        items: [
          {label: 'Pococke 400', icon: 'book'},
          {label: 'Parker 578', icon: 'book'},
          {label: 'Paris 5881', icon: 'book'},
          {label: 'Paris 3465', icon: 'book'},
          {label: 'Paris 3466', icon: 'book'},
          {label: 'Ayasofya 4095', icon: 'book'},
          {label: 'Paris 3471', icon: 'book'},
          {label: 'Paris 3475', icon: 'book'},
          {label: 'Paris 2789', icon: 'book'},
          {label: 'Paris 3473', icon: 'book'},
        ]
      },
      {label: 'Facsimile-Text', styleClass: 'menucus', icon: 'insert_drive_file',command:()=> this.navigateToFacsimileText()},
      {label: 'Facsimile', styleClass: 'menucus', icon: 'image'},
      {label: 'MS Description', icon: 'info', styleClass: 'menucus'},
      {label: 'Fullscreen', styleClass: 'menucus', icon: 'fullscreen'}
    ];
  }

  hasSubItems(item: any): boolean {
    return item && item.items && item.items.length > 0;
  }

  navigateToFacsimileText() {
    const manuscriptId = 'P5881';// Replace this with the actual manuscript ID
    const chapter='lv';
    const page='1'
    this.router.navigateByUrl(
      `/manuscripts/${manuscriptId}/${chapter}/${page}`,
      { relativeTo: this.route.parent } as NavigationExtras );
  }


}
