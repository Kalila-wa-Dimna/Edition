import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  HostListener,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { IGalleryInfo } from '../../models/manuscript-summary.model';
import { ActivatedRoute } from '@angular/router';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

interface GalleryItem {
  src: string;
  thumb: string;
  caption: string;
  thumbFailed?: boolean;
  thumbLoaded?: boolean;
}

@Component({
  selector: 'kalila-edition-manuscript-page-gallery-viewer',
  templateUrl: './manuscript-page-gallery-viewer.component.html',
  styleUrls: ['./manuscript-page-gallery-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ManuscriptPageGalleryViewerComponent implements OnInit, OnDestroy {
  @ViewChild('thumbStrip') thumbStrip?: ElementRef<HTMLElement>;

  /** Mount lightbox on body so mat-sidenav cannot clip the top toolbar. */
  @ViewChild('lightboxRoot')
  set lightboxRoot(ref: ElementRef<HTMLElement> | undefined) {
    if (!this.isBrowser || !ref?.nativeElement) {
      return;
    }
    const el = ref.nativeElement;
    if (el.parentElement !== document.body) {
      document.body.appendChild(el);
    }
  }

  data: GalleryItem[] = [];
  manuscriptId = '';
  pagesEndPoint = this.config.pagesEndPoint;
  sub?: Subscription;
  isBrowser = false;

  lightboxOpen = false;
  activeIndex = 0;
  mainImageLoaded = false;
  mainImageFailed = false;

  /** Only load strip thumbs near the visible window (full pages are large). */
  readonly stripThumbRadius = 16;
  private stripWindowCenter = 0;
  /** Once loaded, keep the thumb mounted so RTL scroll doesn't blank them. */
  private stripLoadedIndexes = new Set<number>();
  private stripScrollRaf = 0;

  /** Loupe / zoom */
  readonly minZoom = 1;
  readonly maxZoom = 4;
  readonly zoomStep = 0.25;
  zoom = 1;
  panX = 0;
  panY = 0;
  private panning = false;
  private panStartX = 0;
  private panStartY = 0;
  private panOriginX = 0;
  private panOriginY = 0;

  get isRtlManuscript(): boolean {
    return !/latin|english/i.test(this.manuscriptId || '');
  }

  get pageCount(): number {
    return this.data?.length ?? 0;
  }

  get activeItem(): GalleryItem | null {
    return this.data[this.activeIndex] ?? null;
  }

  get zoomPercent(): number {
    return Math.round(this.zoom * 100);
  }

  get imageTransform(): string {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  get canZoomIn(): boolean {
    return this.zoom < this.maxZoom;
  }

  get canZoomOut(): boolean {
    return this.zoom > this.minZoom;
  }

  webpSrc(src: string): string {
    return (src || '')
      .replace('.jpg', '.webp')
      .replace('.jpeg', '.webp');
  }

  constructor(
    private route: ActivatedRoute,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.manuscriptId = this.route.snapshot.paramMap.get('id') || '';

    this.sub = this.route.data.subscribe((data) => {
      this.manuscriptId = this.route.snapshot.paramMap.get('id') || '';
      const galleryData = data['galleryData'] ?? [];
      this.stripLoadedIndexes.clear();
      this.data = galleryData.map((item: IGalleryInfo) => ({
        src: this.webpSrc(this.pagesEndPoint + item.src),
        thumb: this.webpSrc(this.pagesEndPoint + (item.thumb || item.src)),
        caption: item.caption || '',
      }));
    });
  }

  openLightbox(index: number): void {
    if (index < 0 || index >= this.data.length) {
      return;
    }
    this.activeIndex = index;
    this.stripWindowCenter = index;
    this.markStripRangeLoaded(index);
    this.resetZoom();
    this.resetMainImageState();
    this.lightboxOpen = true;
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => this.scrollActiveThumbIntoView(), 0);
      setTimeout(() => this.scrollActiveThumbIntoView(), 120);
    }
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.resetZoom();
    this.resetMainImageState();
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  selectThumb(index: number): void {
    if (index < 0 || index >= this.data.length) {
      return;
    }
    this.activeIndex = index;
    this.stripWindowCenter = index;
    this.markStripRangeLoaded(index);
    this.resetZoom();
    this.resetMainImageState();
    this.scrollActiveThumbIntoView();
  }

  shouldLoadStripThumb(index: number): boolean {
    if (this.stripLoadedIndexes.has(index)) {
      return true;
    }
    return (
      Math.abs(index - this.stripWindowCenter) <= this.stripThumbRadius ||
      Math.abs(index - this.activeIndex) <= this.stripThumbRadius
    );
  }

  /**
   * Use viewport geometry (RTL-safe). scrollLeft math breaks with dir=rtl.
   */
  onThumbStripScroll(): void {
    if (!this.isBrowser) {
      return;
    }
    if (this.stripScrollRaf) {
      cancelAnimationFrame(this.stripScrollRaf);
    }
    this.stripScrollRaf = requestAnimationFrame(() => {
      this.stripScrollRaf = 0;
      this.updateStripWindowFromViewport();
    });
  }

  /** Scroll the thumb filmstrip by roughly one viewport page. */
  scrollStripPage(direction: number, event?: Event): void {
    event?.stopPropagation();
    const strip = this.thumbStrip?.nativeElement;
    if (!strip || !this.data.length) {
      return;
    }
    const thumb = strip.querySelector(
      '.ms-lightbox-thumb'
    ) as HTMLElement | null;
    const thumbWidth = (thumb?.offsetWidth || 72) + 6;
    const pageSize = Math.max(
      3,
      Math.floor(strip.clientWidth / thumbWidth) - 1
    );
    const target = Math.max(
      0,
      Math.min(
        this.data.length - 1,
        this.stripWindowCenter + direction * pageSize
      )
    );
    this.stripWindowCenter = target;
    this.markStripRangeLoaded(target);
    const el = strip.querySelector(
      `.ms-lightbox-thumb[data-index="${target}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }

  get canScrollStripPrev(): boolean {
    return this.stripWindowCenter > 0 || this.activeIndex > 0;
  }

  get canScrollStripNext(): boolean {
    const last = this.data.length - 1;
    return this.stripWindowCenter < last || this.activeIndex < last;
  }

  onThumbError(item: GalleryItem): void {
    // Prefer JPG if WebP is missing for a page
    if (/\.webp($|\?)/i.test(item.thumb)) {
      item.thumb = item.thumb.replace(/\.webp/i, '.jpg');
      return;
    }
    item.thumbFailed = true;
  }

  private updateStripWindowFromViewport(): void {
    const strip = this.thumbStrip?.nativeElement;
    if (!strip || !this.data.length) {
      return;
    }
    const stripRect = strip.getBoundingClientRect();
    const centerX = stripRect.left + stripRect.width / 2;
    let closestIndex = this.activeIndex;
    let closestDist = Number.POSITIVE_INFINITY;
    const thumbs = strip.querySelectorAll(
      '.ms-lightbox-thumb'
    ) as NodeListOf<HTMLElement>;
    thumbs.forEach((thumb) => {
      const rect = thumb.getBoundingClientRect();
      // Skip fully off-screen buttons
      if (rect.right < stripRect.left || rect.left > stripRect.right) {
        return;
      }
      const mid = rect.left + rect.width / 2;
      const dist = Math.abs(mid - centerX);
      const idx = Number(thumb.dataset['index']);
      if (!Number.isFinite(idx)) {
        return;
      }
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = idx;
      }
    });
    this.stripWindowCenter = closestIndex;
    this.markStripRangeLoaded(closestIndex);
  }

  private markStripRangeLoaded(center: number): void {
    const start = Math.max(0, center - this.stripThumbRadius);
    const end = Math.min(this.data.length - 1, center + this.stripThumbRadius);
    for (let i = start; i <= end; i++) {
      this.stripLoadedIndexes.add(i);
    }
  }

  onThumbLoad(item: GalleryItem): void {
    item.thumbLoaded = true;
  }

  onMainImageLoad(): void {
    this.mainImageLoaded = true;
    this.mainImageFailed = false;
  }

  onMainImageError(): void {
    this.mainImageLoaded = false;
    this.mainImageFailed = true;
  }

  private resetMainImageState(): void {
    this.mainImageLoaded = false;
    this.mainImageFailed = false;
  }

  nextPage(event?: Event): void {
    event?.stopPropagation();
    if (this.activeIndex < this.data.length - 1) {
      this.selectThumb(this.activeIndex + 1);
    }
  }

  prevPage(event?: Event): void {
    event?.stopPropagation();
    if (this.activeIndex > 0) {
      this.selectThumb(this.activeIndex - 1);
    }
  }

  zoomIn(event?: Event): void {
    event?.stopPropagation();
    this.setZoom(this.zoom + this.zoomStep);
  }

  zoomOut(event?: Event): void {
    event?.stopPropagation();
    this.setZoom(this.zoom - this.zoomStep);
  }

  resetZoom(event?: Event): void {
    event?.stopPropagation();
    this.zoom = this.minZoom;
    this.panX = 0;
    this.panY = 0;
  }

  private setZoom(next: number): void {
    const clamped = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, Math.round(next / this.zoomStep) * this.zoomStep)
    );
    this.zoom = Number(clamped.toFixed(2));
    if (this.zoom === this.minZoom) {
      this.panX = 0;
      this.panY = 0;
    }
  }

  onPanStart(event: PointerEvent): void {
    if (this.zoom <= this.minZoom || event.button !== 0) {
      return;
    }
    const target = event.currentTarget as HTMLElement;
    this.panning = true;
    this.panStartX = event.clientX;
    this.panStartY = event.clientY;
    this.panOriginX = this.panX;
    this.panOriginY = this.panY;
    target.setPointerCapture(event.pointerId);
  }

  onPanMove(event: PointerEvent): void {
    if (!this.panning) {
      return;
    }
    this.panX = this.panOriginX + (event.clientX - this.panStartX);
    this.panY = this.panOriginY + (event.clientY - this.panStartY);
  }

  onPanEnd(event: PointerEvent): void {
    if (!this.panning) {
      return;
    }
    this.panning = false;
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  }

  onThumbStripWheel(event: WheelEvent): void {
    const strip = this.thumbStrip?.nativeElement;
    if (!strip) {
      return;
    }
    if (event.deltaY !== 0) {
      event.preventDefault();
      // Visual scroll: same direction in LTR/RTL via scrollBy
      strip.scrollBy({ left: event.deltaY, behavior: 'auto' });
      this.onThumbStripScroll();
    }
  }

  private scrollActiveThumbIntoView(): void {
    const strip = this.thumbStrip?.nativeElement;
    if (!strip) {
      return;
    }
    const active = strip.querySelector(
      `.ms-lightbox-thumb[data-index="${this.activeIndex}"]`
    ) as HTMLElement | null;
    if (!active) {
      return;
    }
    active.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen) {
      return;
    }
    if (event.key === 'Escape') {
      this.closeLightbox();
      return;
    }
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      this.zoomIn();
      return;
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      this.zoomOut();
      return;
    }
    if (event.key === '0') {
      event.preventDefault();
      this.resetZoom();
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (this.isRtlManuscript) {
        this.prevPage();
      } else {
        this.nextPage();
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (this.isRtlManuscript) {
        this.nextPage();
      } else {
        this.prevPage();
      }
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.stripScrollRaf) {
      cancelAnimationFrame(this.stripScrollRaf);
    }
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }
}
