import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ICollationFacsimileHighlight {
  siglum: string;
  page: number;
  line: number;
  unit: number;
  column: number;
  unitDisplay: string;
}



@Injectable({
  providedIn: 'root',
})
export class FacsimileWorkerService {
  private _facsimile: Worker | undefined;
  currentLines: BehaviorSubject<Map<string, ICollationFacsimileHighlight & { dataUrl: string }>> = new BehaviorSubject(new Map<string, ICollationFacsimileHighlight & { dataUrl: string }>());

  init(facsimileWorker: Worker): void {
    this._facsimile = facsimileWorker;

    this._facsimile.onmessage = ({ data }) => {
      const { id, content } = data;
      this.addRegion(id, content);
    };
  }

  requestRegion(info: ICollationFacsimileHighlight, url: string, points: number[], rotation: number) {
    this._facsimile?.postMessage({ info, url, points, rotation });
  }

  addRegion(id: string, data: ICollationFacsimileHighlight & { dataUrl: string }) {
    const current = this.currentLines.getValue();
    current.set(id, data);
    this.currentLines.next(current);
  }

  removeRegion(id: string) {
    const current = this.currentLines.getValue();
    current.delete(id);
    this.currentLines.next(current);
  }

  terminate(): void {
    this._facsimile?.terminate();
  }
}
