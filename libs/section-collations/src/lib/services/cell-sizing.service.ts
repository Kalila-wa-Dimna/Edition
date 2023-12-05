import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { CollationSettingsService } from './collation-settings.service';
import { ICollationUnit } from '../models/collation-page-data.model';
import {
  CELL_PADDING,
  SIZE_MAP,
} from '../constants/size.constants';
import { CollationDataService } from './collation-data.service';
import { ICellData } from '../models/collation-row-data.model';

export const MIN_HEIGHT = 75;
const HEADER_PADDING = '5px';
@Injectable()
export class CellSizingService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private settingsSerivce: CollationSettingsService,
    private dataService: CollationDataService
  ) { }
  getSize(unit: ICollationUnit, unitIdx: number): number {
    if (!this.dataService.cache[unitIdx]) {
      return MIN_HEIGHT;
    }
    const segment = this.dataService.cache[unitIdx]?.[unit.longestSegment];

    if (unit.divider) {
      return this.getHeadingHeight(unit.title);
    }

    return this.getContentHeight(segment) + this.getHeadingHeight(unit.title);
  }

  private getHeadingHeight(title: string) {
    const { size } = this.settingsSerivce.state$.getValue();
    const phantom = this.document.createElement('div');
    phantom.style.fontSize = `${SIZE_MAP[size].font}px`;
    phantom.style.position = 'absolute';
    phantom.style.visibility = 'hidden';
    phantom.style.paddingTop = HEADER_PADDING;
    phantom.style.paddingBottom = HEADER_PADDING;

    phantom.textContent = title;
    // Add the phantom to the body
    this.document.body.appendChild(phantom);

    // Get the size of the text
    const headingHeight = phantom.offsetHeight;

    // Remove the phantom from the body
    this.document.body.removeChild(phantom);
    return headingHeight;
  }

  private getContentHeight(segment: ICellData | undefined) {
    const phantom = this.document.createElement('div');
    const { size } = this.settingsSerivce.state$.getValue();
    phantom.className = `collation-cell rtl font-noto-naskh`;
    phantom.style.fontSize = `${SIZE_MAP[size].font}px`;
    // Set the width of the container
    phantom.style.width = `${SIZE_MAP[size].cell}px`;

    // Ensure the element is not visible and does not affect the layout
    phantom.style.position = 'absolute';
    phantom.style.visibility = 'hidden';
    phantom.style.padding = `${CELL_PADDING}px`;
    // Set the text
    const text = segment ? segment.tokens.join(' ') : '\n[absent]\n';
    phantom.textContent = text;

    // Add the phantom to the body
    this.document.body.appendChild(phantom);

    // Get the size of the text
    const contentHeight = phantom.offsetHeight;

    // Remove the phantom from the body
    this.document.body.removeChild(phantom);

    return contentHeight + 25;
  }
}
