import { Injectable } from '@angular/core';
import { ICollationColumn } from '../models/collation-page-data.model';
import { FacsimileWorkerService } from '@kalila-edition/common-ui';

@Injectable()
export class FacsimilePanelService {
  private unitsWithVisibleFacsimile: Map<string, Record<number, Set<number>>> =
    new Map<string, Record<number, Set<number>>>();

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
  constructor(private workerService: FacsimileWorkerService) { }

  addUnit(
    unitId: string,
    siglum: string,
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


    Object.keys(loc).forEach((page: string) => {
      const pageNumber = parseInt(page);
      loc[pageNumber].forEach((line: number) => {
        try {
          const points = this._columns[mediumId].facsimiles[pageNumber].lines[line].slice(0, -1);
          const rotation = this._columns[mediumId].facsimiles[pageNumber].lines[line][8];
          this.workerService.requestRegion(siglum, pageNumber, line, this._columns[mediumId].facsimiles[pageNumber].url, points, rotation);
        } catch (e) {
          console.error(e);
        }
      })
    })

    this.unitsWithVisibleFacsimile.set(`${unitId}-${siglum}`, loc);
  }

  hasUnit(unitId: string, siglum: string): boolean {
    return this.unitsWithVisibleFacsimile.has(`${unitId}-${siglum}`);
  }

  removeUnit(unitId: string, siglum: string): void {
    const loc = this.unitsWithVisibleFacsimile.get(`${unitId}-${siglum}`);
    if (!loc) {
      return;
    }
    Object.keys(loc).forEach((page: string) => {
      loc[parseInt(page)].forEach((line: number) => {
        this.workerService.removeRegion(`${siglum}_${page}_${line}`);
      })
    })

    this.unitsWithVisibleFacsimile.delete(`${unitId}-${siglum}`);
  }

  canAddUnit() {
    return this.unitsWithVisibleFacsimile.size <= 2;
  }
}
