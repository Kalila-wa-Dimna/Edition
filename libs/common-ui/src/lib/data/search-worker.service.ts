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
      const { type, results, sentence, collationKey, indexedResults } = data;
      if (type === 'results') {
        this.searchResults$.next({
          sentence,
          collationKey,
          results,
          indexedResults,
        });
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

  terminate(): void {
    this._search?.terminate();
  }
}
