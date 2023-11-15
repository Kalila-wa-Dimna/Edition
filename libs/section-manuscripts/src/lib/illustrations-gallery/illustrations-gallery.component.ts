import { Component, ElementRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { CONFIG_TOKEN, IConfig } from "@kalila-edition/common-ui";
import { MatDialog } from '@angular/material/dialog';
import { IllustrationModalComponent } from './illustration-modal.component'

@Component({
  selector: 'kalila-edition-illustrations-gallery',
  templateUrl: './illustrations-gallery.component.html',
  styleUrls: ['./illustrations-gallery.component.scss'],
})
export class IllustrationsGalleryComponent {
  data: any;
  pagesEndPoint = this.config.imagesEndPoint + 'illustrations/';
  displayedColumns: string[] = ['chapter', 'manuscripts'];
  constructor(private dialog: MatDialog,private route: ActivatedRoute, private router: Router, private _elementRef: ElementRef, @Inject(CONFIG_TOKEN) private config: IConfig,) {
    this.data = this.route.snapshot.data;
  }
  getKeys(): string[] {
    return this.data.illustrationsList.chapter;
  }

  getIllustrationName(illustrationUrl: string): string {
    // Extract the name of the illustration from the URL
    const splitParts = illustrationUrl.split('_');
    if (splitParts.length >= 2) {
      const illustrationName = 'page ' + splitParts.slice(1, 2).join(''); // Join the first two parts
      return illustrationName;
    }
    return '';
  }

  openIllustrationModal(illustration: string): void {
    this.dialog.open(IllustrationModalComponent, {
      data: { illustration },
    });}
}
