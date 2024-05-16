import { Component, OnInit, HostListener, Inject, PLATFORM_ID, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { FacsimileService } from "./../../services/manuscript-data.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { isPlatformBrowser } from '@angular/common';
import { CONFIG_TOKEN, IConfig } from "@kalila-edition/common-ui";
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'kalila-edition-manuscript-page-facsimile',
  templateUrl: './manuscript-page-facsimile.component.html',
  styleUrls: ['./manuscript-page-facsimile.component.scss'],
})
export class ManuscriptPageFacsimileComponent implements OnInit {

  facsimile: any;
  form: FormGroup;
  facsimileSize = '65%';
  facsimileS = new FormControl(40);
  pageData$!: Observable<any>;
  pagesEndPoint = this.config.pagesEndPoint;
  isNewWindow = false;
  disabled = false;
  max = 100;
  min = 0;
  showTicks = false;
  thumbLabel = false;
  value = 0;
  // Default size

  constructor(
    private route: ActivatedRoute,
    private el: ElementRef,
    private renderer: Renderer2,
    private facsimileService: FacsimileService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {
    this.form = this.fb.group({
      facsimileS: this.facsimileS,
    });
  }

  ngOnInit() {
    this.facsimileS = new FormControl(40);
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
      this.facsimileSize = '65%';
    } else {
      this.facsimileSize = '40%';
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    // Update the value when the window is resized
    this.updateFacsimileSize((event.target as Window).innerWidth);
  }

  // ControlValueAccessor methods implementation
  writeValue(obj: any): void {
    this.facsimileS.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.facsimileS.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    // Implement if needed
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }
}
