import {
  CdkVirtualScrollViewport,
  VirtualScrollStrategy,
} from '@angular/cdk/scrolling';
import { distinctUntilChanged, Observable, BehaviorSubject } from 'rxjs';
import { CellSizingService } from '../../services/cell-sizing.service';
import { ICollationUnit } from '../../models/collation-page-data.model';

const PaddingAbove = 5;
const PaddingBelow = 5;

interface UnitHeight {
  value: number;
  source: 'predicted' | 'actual';
}

export class CollationVirtualScrollStrategy implements VirtualScrollStrategy {
  constructor(private sizing: CellSizingService) {}
  scrolledIndexChangeSubject$ = new BehaviorSubject<number>(0);
  scrolledIndexChange: Observable<number> =
    this.scrolledIndexChangeSubject$.pipe(distinctUntilChanged());

  private _viewport!: CdkVirtualScrollViewport | null;
  private _wrapper!: ChildNode | null;
  private _units: ICollationUnit[] = [];
  private _heightCache = new Map<string, UnitHeight>();

  attach(viewport: CdkVirtualScrollViewport): void {
    this._viewport = viewport;
    this._wrapper = viewport.getElementRef().nativeElement.childNodes[0];
    if (this._units) {
      this._viewport.setTotalContentSize(this._getTotalHeight());
      this._updateRenderedRange();
    }
  }

  detach(): void {
    this._viewport = null;
    this._wrapper = null;
  }

  onContentScrolled(): void {
    if (this._viewport) {
      this._updateRenderedRange();
    }
  }

  onDataLengthChanged(): void {
    if (!this._viewport) {
      return;
    }

    this._viewport.setTotalContentSize(this._getTotalHeight());
    this._updateRenderedRange();
  }

  onContentRendered(): void {
    /** no-op */
  }

  onRenderedOffsetChanged(): void {
    /** no-op */
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (!this._viewport) {
      return;
    }

    const offset = this._getOffsetByUnitIdx(index);
    this._viewport.scrollToOffset(offset, behavior);
  }

  /**
   * Update the messages array.
   *
   * @param units
   */
  updateUnits(units: ICollationUnit[]) {
    this._units = units;

    if (this._viewport) {
      this._viewport.checkViewportSize();
      this._viewport.setTotalContentSize(this._getTotalHeight());
    }
  }

  /**
   * Returns the total height of the scrollable container
   * given the size of the elements.
   */
  private _getTotalHeight(): number {
    return this._measureUnitsHeight(this._units);
  }

  /**
   * Returns the offset relative to the top of the container
   * by a provided message index.
   *
   * @param idx
   * @returns
   */
  private _getOffsetByUnitIdx(idx: number): number {
    return this._measureUnitsHeight(this._units.slice(0, idx));
  }

  /**
   * Returns the message index by a provided offset.
   *
   * @param offset
   * @returns
   */
  private _getUnitIdxByOffset(offset: number): number {
    let accumOffset = 0;

    for (let i = 0; i < this._units.length; i++) {
      const unit = this._units[i];
      const unitHeight = this._getUnitHeight(unit, i);
      accumOffset += unitHeight;

      if (accumOffset >= offset) {
        return i;
      }
    }

    return 0;
  }

  /**
   * Measure messages height.
   *
   * @param units
   * @returns
   */
  private _measureUnitsHeight(units: ICollationUnit[]): number {
    return units
      .map((u, i) => this._getUnitHeight(u, i))
      .reduce((a, c) => a + c, 0);
  }

  /**
   * Determine the number of renderable messages
   * withing the viewport by given message index.
   *
   * @param startIdx
   * @returns
   */
  private _determineMsgsCountInViewport(startIdx: number): number {
    if (!this._viewport) {
      return 0;
    }

    let totalSize = 0;
    const viewportSize = this._viewport.getViewportSize();

    for (let i = startIdx; i < this._units.length; i++) {
      const unit = this._units[i];
      totalSize += this._getUnitHeight(unit, i);

      if (totalSize >= viewportSize) {
        return i - startIdx + 1;
      }
    }

    return 0;
  }

  /**
   * Update the range of rendered messages.
   *
   * @returns
   */
  private _updateRenderedRange() {
    if (!this._viewport) {
      return;
    }

    const scrollOffset = this._viewport.measureScrollOffset();
    const scrollIdx = this._getUnitIdxByOffset(scrollOffset);
    const dataLength = this._viewport.getDataLength();
    const renderedRange = this._viewport.getRenderedRange();
    const range = {
      start: renderedRange.start,
      end: renderedRange.end,
    };

    range.start = Math.max(0, scrollIdx - PaddingAbove);
    range.end = Math.min(
      dataLength,
      scrollIdx + this._determineMsgsCountInViewport(scrollIdx) + PaddingBelow
    );

    this._viewport.setRenderedRange(range);
    this._viewport.setRenderedContentOffset(
      this._getOffsetByUnitIdx(range.start)
    );
    this.scrolledIndexChangeSubject$.next(scrollIdx);

    this._updateHeightCache();
  }

  /**
   * Get the height of a given message.
   * It could be either predicted or actual.
   * Results are memoized.
   *
   * @param unit
   * @returns
   */
  private _getUnitHeight(unit: ICollationUnit, unitIdx: number): number {
    let height = 0;
    const cachedHeight = this._heightCache.get(unit.id);

    if (!cachedHeight) {
      height = this.sizing.getSize(unit, unitIdx);
      this._heightCache.set(unit.id, { value: height, source: 'predicted' });
    } else {
      height = cachedHeight.value;
    }

    return height;
  }

  /**
   * Update the height cache with the actual height
   * of the rendered message components.
   *
   * @returns
   */
  private _updateHeightCache() {
    if (!this._wrapper || !this._viewport) {
      return;
    }

    const nodes = this._wrapper.childNodes;
    let cacheUpdated = false;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i] as HTMLElement;

      if (node && node.nodeName === 'APP-HERO-MESSAGE') {
        const id = node.getAttribute('data-hm-id') as string;
        const cachedHeight = this._heightCache.get(id);

        if (!cachedHeight || cachedHeight.source !== 'actual') {
          const height = node.clientHeight;

          this._heightCache.set(id, { value: height, source: 'actual' });
          cacheUpdated = true;
        }
      }
    }

    if (cacheUpdated) {
      this._viewport.setTotalContentSize(this._getTotalHeight());
    }
  }
}
