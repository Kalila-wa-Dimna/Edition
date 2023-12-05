import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FacsimileWorkerService {
  private _facsimile: Worker | undefined;
  currentLines: BehaviorSubject<Map<string, string>> = new BehaviorSubject(new Map<string, string>());

  init(facsimileWorker: Worker): void {
    this._facsimile = facsimileWorker;

    this._facsimile.onmessage = ({ data }) => {
      const { id, region } = data;
      this.addRegion(id, region);
    };
  }

  requestRegion(medium: string, page: number, line: number, url: string, points: number[], rotation: number) {
    this._facsimile?.postMessage({ medium, page, line, url, points, rotation });
  }

  addRegion(id: string, region: string) {
    const current = this.currentLines.getValue();
    current.set(id, region);
    this.currentLines.next(current);
  }

  removeRegion(id: string) {
    console.log(id);
    const current = this.currentLines.getValue();
    current.delete(id);
    this.currentLines.next(current);
  }

  terminate(): void {
    this._facsimile?.terminate();
  }
}
