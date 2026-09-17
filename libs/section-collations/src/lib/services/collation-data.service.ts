import { Injectable } from '@angular/core';
import { IRowData } from '../models/collation-row-data.model';
import {
  alignSegmentDataToUnits,
  buildContentIndexToUnitIndex,
} from '../utils/align-segment-data';
import { ICollationUnit } from '../models/collation-page-data.model';

export type SequenceArrow = 'up' | 'down';

@Injectable()
export class CollationDataService {
  cache: Array<IRowData | undefined> = [];

  /**
   * Maps content-only segment/search indices → full `units` indices
   * (skips dividers). Empty when units have no dividers or lengths already match.
   */
  contentIndexToUnitIndex: number[] = [];

  /** Per-siglum unit-index → arrow when that MS reorders units. */
  private sequenceArrows = new Map<string, Array<SequenceArrow | null>>();

  init(length = 300) {
    this.cache = Array.from<IRowData | undefined>({
      length,
    });
    this.sequenceArrows.clear();
    this.contentIndexToUnitIndex = [];
  }

  /**
   * Align segment rows to units (pad empty rows for dividers) and refresh cache.
   */
  setAlignedSegmentData(units: ICollationUnit[], segmentData: IRowData[]) {
    const aligned = alignSegmentDataToUnits(units, segmentData);
    this.cache = aligned;
    this.contentIndexToUnitIndex = buildContentIndexToUnitIndex(units);
    this.invalidateSequenceArrows();
    return aligned;
  }

  toUnitIndex(contentIndex: number): number {
    const mapped = this.contentIndexToUnitIndex[contentIndex];
    return mapped !== undefined ? mapped : contentIndex;
  }

  /** Call when `cache` is replaced with new segment data. */
  invalidateSequenceArrows() {
    this.sequenceArrows.clear();
  }

  /**
   * Up/down when this manuscript’s reading order disagrees with collation order.
   * Uses orderInMs across the cache (same idea as the map’s OOO detection).
   */
  sequenceArrow(siglum: string, unitArrayIndex: number): SequenceArrow | null {
    let arrows = this.sequenceArrows.get(siglum);
    if (!arrows) {
      arrows = this.computeSequenceArrows(siglum);
      this.sequenceArrows.set(siglum, arrows);
    }
    return arrows[unitArrayIndex] ?? null;
  }

  private computeSequenceArrows(siglum: string): Array<SequenceArrow | null> {
    const arrows: Array<SequenceArrow | null> = new Array(this.cache.length).fill(
      null
    );
    const pairs: { u: number; orderInMs: number }[] = [];
    for (let u = 0; u < this.cache.length; u++) {
      const cell = this.cache[u]?.[siglum];
      if (!cell || cell.lacuna || cell.orderInMs == null) {
        continue;
      }
      pairs.push({ u, orderInMs: cell.orderInMs });
    }
    const expected = pairs.map((p) => p.orderInMs).sort((a, b) => a - b);
    for (let i = 0; i < pairs.length; i++) {
      const actual = pairs[i].orderInMs;
      const exp = expected[i];
      if (actual > exp) {
        arrows[pairs[i].u] = 'down';
      } else if (actual < exp) {
        arrows[pairs[i].u] = 'up';
      }
    }
    return arrows;
  }
}
