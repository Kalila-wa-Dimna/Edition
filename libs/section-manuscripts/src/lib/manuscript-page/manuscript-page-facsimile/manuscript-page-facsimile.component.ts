import {
  Component,
  OnInit,
  OnDestroy,
  HostBinding,
  HostListener,
  Inject,
  PLATFORM_ID,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacsimileService } from './../../services/manuscript-data.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'kalila-edition-manuscript-page-facsimile',
  templateUrl: './manuscript-page-facsimile.component.html',
  styleUrls: ['./manuscript-page-facsimile.component.scss'],
  standalone: false,
})
export class ManuscriptPageFacsimileComponent implements OnInit, OnDestroy {
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
  imageLoaded = false;
  pageLabel = '';
  sizePercent = 65;
  isVisible = true;
  readonly minSize = 25;
  readonly maxSize = 150;
  readonly sizeStep = 5;
  private visibleSub?: Subscription;

  @HostBinding('class.is-hidden')
  get hiddenHostClass(): boolean {
    return !this.isVisible;
  }

  constructor(
    private route: ActivatedRoute,
    private el: ElementRef,
    private renderer: Renderer2,
    private facsimileService: FacsimileService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(CONFIG_TOKEN) private config: IConfig
  ) {
    this.form = this.fb.group({
      facsimileS: this.facsimileS,
    });
  }

  get imageSrc(): string {
    if (!this.facsimile) {
      return '';
    }
    return (
      this.pagesEndPoint +
      this.facsimile.replace('.jpg', '.webp').replace('.jpeg', '.webp')
    );
  }

  ngOnInit() {
    this.facsimileS = new FormControl(40);
    this.isVisible = this.facsimileService.visible;
    this.pageData$ = this.route.data.pipe(map((data) => data));
    if (isPlatformBrowser(this.platformId)) {
      this.updateFacsimileSize(window.innerWidth);
    }
    this.visibleSub = this.facsimileService.visible$.subscribe((visible) => {
      this.isVisible = visible;
    });
    this.route.data.subscribe((data) => {
      const { pageData } = data;
      const nextFacsimile = pageData?.imageUrl ?? '';
      // Arabic ↔ English often share the same facsimile URL. Resetting
      // imageLoaded would hide the image forever because <img> does not
      // re-fire (load) when src is unchanged.
      if (nextFacsimile !== this.facsimile) {
        this.imageLoaded = false;
      } else if (nextFacsimile) {
        this.imageLoaded = true;
      }
      this.facsimile = nextFacsimile;
      const manuscript = pageData?.manuscript;
      const number = pageData?.number;
      this.pageLabel =
        manuscript && number != null ? `${manuscript} · p. ${number}` : '';
    });

    this.facsimileService.facsimileSize$.subscribe((size: string) => {
      this.applySize(parseInt(size, 10));
    });
  }

  hideFacsimile(): void {
    this.facsimileService.hide();
  }

  ngOnDestroy(): void {
    this.visibleSub?.unsubscribe();
  }

  onImageLoad(): void {
    this.imageLoaded = true;
  }

  onImageError(): void {
    this.imageLoaded = true;
  }

  increaseSize(): void {
    this.setSize(this.sizePercent + this.sizeStep);
  }

  decreaseSize(): void {
    this.setSize(this.sizePercent - this.sizeStep);
  }

  private setSize(size: number): void {
    this.applySize(size);
    this.facsimileService.changeFacsimileSize(this.facsimileSize);
  }

  private applySize(size: number): void {
    if (Number.isNaN(size)) {
      return;
    }
    this.sizePercent = Math.min(this.maxSize, Math.max(this.minSize, size));
    this.facsimileSize = `${this.sizePercent}%`;
  }

  private updateFacsimileSize(innerWidth: number): void {
    if (innerWidth >= 1800) {
      this.applySize(78);
    } else if (innerWidth >= 1440) {
      this.applySize(72);
    } else if (innerWidth >= 896) {
      this.applySize(65);
    } else if (innerWidth >= 600) {
      this.applySize(70);
    } else {
      this.applySize(92);
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
