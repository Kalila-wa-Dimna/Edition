import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IContentSearchResult {
  sentence: string;
  collationKey: string;
  results: number[][];
  indexedResults: Record<
    number,
    Record<number, [number, number, number, number, number][]>
  >;
}

@Injectable({
  providedIn: 'root',
})
export class SearchWorkerService {
  private _search: Worker | undefined;

  searchResults$ = new BehaviorSubject<IContentSearchResult | undefined>(
    undefined
  );

  init(searchWorker: Worker): void {
    this._search = searchWorker;
    this._search.onmessage = ({ data }) => {
      const { type, ...payload } = data;
      if (type === 'results') {
        this.searchResults$.next(payload);
      }
      if (type === 'clear') {
        this.searchResults$.next(undefined);
      }
    };
  }

  initCollation(collationKey: string): void {
    this._search?.postMessage({
      requestType: 'init',
      collationKey,
    });
  }

  search(sentence: string, collationKey: string): void {
    this._search?.postMessage({
      requestType: 'search',
      sentence,
      collationKey,
    });
  }

  reset(): void {
    this._search?.postMessage({
      requestType: 'reset',
    });
  }

  terminate(): void {
    this._search?.terminate();
  }
}
