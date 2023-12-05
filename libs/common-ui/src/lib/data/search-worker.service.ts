import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SearchWorkerService {
  private _search: Worker | undefined;

  init(searchWorker: Worker): void {
    this._search = searchWorker;
    this._search.onmessage = ({ data }) => {
      console.log(`page got message: ${data}`);
    };
    this._search.postMessage('hello');
  }

  terminate(): void {
    this._search?.terminate();
  }
}
