import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { CONFIG_TOKEN, IConfig } from "@kalila-edition/common-ui";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

interface IManuscriptsDescriptionInfo {
  display: string;
  siglum: string;
  images: string[];
  image_script: string[]
}

@Component({
  selector: 'kalila-edition-single-page',
  templateUrl: './single-page.component.html',
  styleUrls: ['./single-page.component.scss'],
})
export class SinglePageComponent implements OnInit, OnDestroy {
  data: any;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  pagesEndPoint = this.config.imagesEndPoint + 'manuscripts/';
  imagesEndPoint = this.config.pagesEndPoint;
  pagesEndPointDescription = this.config.imagesEndPoint + 'manuscripts_description/';
  manuscriptsInfo: IManuscriptsDescriptionInfo[] = [];
  categories = [
    { title: 'Siglum', fields: ['siglum__siglum', 'publications__publications'] },
    { title: 'Catalogue', fields: ['catalogue__title', 'catalogue__link'] },
    { title: 'Location', fields: ['location__city', 'location__library', 'location__manuscript_id', 'location__commentary'] },
    { title: 'Publications', fields: ['publications__publications'] },
    { title: 'Dating', fields: ['dating__accuracy', 'dating__gregorian_century', 'dating__hijri_century', 'dating__gregorian_year', 'dating__hijri_year', 'dating__gregorian_date', 'dating__hijri_date', 'dating__commentary'] },
    { title: 'Preservation', fields: ['preservation__status', 'preservation__missing_parts', 'preservation__restored_parts', 'preservation__commentary'] },
    { title: 'Binding', fields: ['binding__type', 'binding__period', 'binding__additional_features', 'binding__commentary'] },
    { title: 'Pagination', fields: ['pagination__present', 'pagination__used', 'pagination__commentary'] },
    { title: 'Composite Manuscript', fields: ['composite_manuscript__bound_with', 'composite_manuscript__commentary'] },
    { title: 'Layout', fields: ['layout__frame', 'layout__catchwords', 'layout__lines_per_page', 'layout__chapter_titles', 'layout__text_division_symbols', 'layout__highlighted_text', 'layout__commentary'] },
    { title: 'Illustrations', fields: ['illustrations__presence', 'illustrations__legend', 'illustrations___commentary'] },
    { title: 'Script', fields: ['script__type', 'script__hands', 'script__execution', 'script__size', 'script__line_spacing', 'script__word_spacing', 'script__letter_spacing', 'script__stroke_direction', 'script__lower_curves', 'script__stroke_thickness', 'script__baseline', 'script__letter_diacritics', 'script__vowel_markers', 'script__present_additional_writing_signs', 'script__commentary'] },
    { title: 'Orthography', fields: ['orthography__sound_shifts', 'orthography__commentary'] }
  ];

  currentImageIndexes: number[] = [];

  private routeSub: Subscription | null = null;
  private dataSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private domSanitizer: DomSanitizer,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: NonNullable<unknown>,
    private httpClient: HttpClient,
  ) {
    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      debounceTime(50)
    ).subscribe(() => {
      this.updateData();
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.routeSub = this.route.paramMap.subscribe(() => {
        this.updateData();
      });

      this.dataSub = this.route.data.subscribe(data => {
        this.data = data['manuscriptDescriptionData'];
        this.updateDataSource();
        this.initializeImageIndexes();
      });

      this.httpClient.get<IManuscriptsDescriptionInfo[]>(
        `${this.config.dataEndPoint}manuscripts_description/overview.json`
      ).subscribe(data => {
        this.manuscriptsInfo = data;
      });
    }
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }

  private updateData() {
    const { id, chapter, pageNumber } = this.route.snapshot.params;
    console.log(`Params - ID: ${id}, Chapter: ${chapter}, Page: ${pageNumber}`);
    this.data = this.route.snapshot.data['manuscriptDescriptionData'];
    this.updateDataSource();
  }

  private updateDataSource() {
    if (this.data) {
      this.dataSource = new MatTableDataSource(this.data);
    }
  }

  private initializeImageIndexes() {
    this.currentImageIndexes = this.categories.map(() => 0);
  }

  prevImage(categoryIndex: number) {
    const images = this.getImagesForCategory(this.categories[categoryIndex].title, this.data.siglum__siglum);
    if (images.length > 0) {
      this.currentImageIndexes[categoryIndex] =
        (this.currentImageIndexes[categoryIndex] - 1 + images.length) % images.length;
    }
  }

  nextImage(categoryIndex: number) {
    const images = this.getImagesForCategory(this.categories[categoryIndex].title, this.data.siglum__siglum);
    if (images.length > 0) {
      this.currentImageIndexes[categoryIndex] =
        (this.currentImageIndexes[categoryIndex] + 1) % images.length;
    }
  }

  sanitizeHtml(value: string): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(value);
  }

  getScriptImagesForSiglum(siglum: string): string[] {
    const manuscript = this.manuscriptsInfo.find(m => m.siglum === siglum);
    return manuscript ? manuscript.image_script : [];
  }

  getImagesForSiglum(siglum: string): string[] {
    const manuscript = this.manuscriptsInfo.find(m => m.siglum === siglum);
    return manuscript ? manuscript.images : [];
  }

  getImagesForCategory(categoryTitle: string, siglum: string): string[] {
    if (categoryTitle === 'Script') {
      return this.getScriptImagesForSiglum(siglum);
    } else if (categoryTitle === 'Layout') {
      return this.getImagesForSiglum(siglum);
    }
    return [];
  }

  scrollToCategory(categoryTitle: string) {
    const element = document.getElementById(categoryTitle.toLowerCase().replace(/ /g, '-'));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  formatFieldName(field: string): string {
    const parts = field.split('__');
    let formattedField = parts.length > 1 ? parts[1].replace(/_/g, ' ') : field.replace(/_/g, ' ');

    // Special case for "manuscript id"
    if (formattedField.toLowerCase() === 'manuscript id') {
      formattedField = 'Manuscript ID';
    } else {
      formattedField = formattedField.charAt(0).toUpperCase() + formattedField.slice(1);
    }

    return formattedField;
  }

  isSpecialField(field: string): boolean {
    const specialFields = [
      'orthography__d_dh_shifts',
      'orthography__za_dad_shifts',
      'orthography__sin_sad_shifts',
      'orthography__tha_ta_shifts'
    ];
    return specialFields.includes(field);
  }
}
