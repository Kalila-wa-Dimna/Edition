import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IContentSearchResult {
  sentence: string;
  collationName: string;
  results: number[][];
  indexedResults: Record<number, Record<number, [number, number, number, number, number][]>>;
}

@Injectable({
  providedIn: 'root',
})
export class SearchWorkerService {
  private _search: Worker | undefined;

  searchResults$ = new BehaviorSubject<IContentSearchResult | undefined>(undefined);

  init(searchWorker: Worker): void {
    this._search = searchWorker;
    this._search.onmessage = ({ data }) => {
      const { type, results, sentence, collationName, indexedResults } = data;
      if (type === 'results') {
        this.searchResults$.next({ sentence, collationName, results, indexedResults });
      }
    };
  }

  initCollation(collationName: string): void {
    this._search?.postMessage({
      requestType: 'init',
      collationName,
    });
  }

  search(sentence: string, collationName: string): void {
    this._search?.postMessage({
      requestType: 'search',
      sentence,
      collationName,
    });
  }

  terminate(): void {
    this._search?.terminate();
  }
}
