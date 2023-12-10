import { Injectable, signal } from '@angular/core';
import { ICollationColumn } from '../models/collation-page-data.model';
import { FacsimileWorkerService, ICollationFacsimileHighlight } from '@kalila-edition/common-ui';

@Injectable()
export class FacsimilePanelService {
  private unitsWithVisibleFacsimile: Map<string, ICollationFacsimileHighlight[]> =
    new Map<string, ICollationFacsimileHighlight[]>();

  private _columns: Record<string, ICollationColumn> = {};

  public get columns(): Record<string, ICollationColumn> {
    return this._columns;
  }
  public set columns(value: ICollationColumn[]) {
    this._columns = {};
    value.forEach((column) => {
      this._columns[column.id] = column;
    });
  }

  stageDataUrl = signal<string | undefined>(undefined)

  constructor(private workerService: FacsimileWorkerService) { }

  addUnit(
    unitIndex: number,
    unitDisplay: string,
    siglum: string,
    mediumIndex: number,
    mediumId: string,
    pages: number[],
    lines: number[]
  ): void {
    const loc: Record<number, Set<number>> = {};
    pages.forEach((page, index) => {
      if (!loc[page]) {
        loc[page] = new Set<number>();
      }
      loc[page].add(lines[index]);
    });


    const highlights: ICollationFacsimileHighlight[] = []
    Object.keys(loc).forEach((page: string) => {
      const pageNumber = parseInt(page);
      loc[pageNumber].forEach((line: number) => {
        try {
          const points = this._columns[mediumId].facsimiles[pageNumber].lines[line].slice(0, -1);
          const rotation = this._columns[mediumId].facsimiles[pageNumber].lines[line][8];
          const highlightInfo = {
            siglum,
            unit: unitIndex,
            column: mediumIndex,
            line: line,
            page: pageNumber,
            unitDisplay
          }
          highlights.push(highlightInfo)
          this.workerService.requestRegion(highlightInfo, this._columns[mediumId].facsimiles[pageNumber].url, points, rotation);
        } catch (e) {
          console.error(e);
        }
      })
    })

    this.unitsWithVisibleFacsimile.set(`${unitIndex}-${siglum}`, highlights);
  }

  hasUnit(unitIndex: number, siglum: string): boolean {
    return this.unitsWithVisibleFacsimile.has(`${unitIndex}-${siglum}`);
  }

  removeUnit(unitIndex: number, siglum: string): void {
    const loc = this.unitsWithVisibleFacsimile.get(`${unitIndex}-${siglum}`);
    if (!loc) {
      return;
    }
    loc.forEach((highlight) => {
      this.workerService.removeRegion(`${siglum}_${highlight.page}_${highlight.line}`);
    })

    this.unitsWithVisibleFacsimile.delete(`${unitIndex}-${siglum}`);
  }

  canAddUnit() {
    return this.unitsWithVisibleFacsimile.size <= 20;
  }
  removeAllUnits() {
    this.unitsWithVisibleFacsimile.forEach((highlights) => {
      highlights.forEach((highlight) => {
        this.workerService.removeRegion(`${highlight.siglum}_${highlight.page}_${highlight.line}`);
      })
    })
    this.unitsWithVisibleFacsimile.clear();
  }
}
