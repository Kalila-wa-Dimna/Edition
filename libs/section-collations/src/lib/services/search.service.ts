import { Injectable, computed, signal } from '@angular/core';

@Injectable()
export class SearchService {
  highlightedRows = signal<number[] | null>(null);

  highlightedTokens = signal<number[][] | null>(null); // [startLine, startToken, endLine, endToken] = array[row][cell]
  indexedResults = signal<Record<
    number,
    Record<number, [number, number, number, number, number][]>
  > | null>(null); // [startLine, startToken, endLine, endToken] = array[row][cell]

  currentResult = signal<number>(0);

  numberOfResults = computed(() => {
    const rows = this.highlightedRows();
    const tokens = this.highlightedTokens();
    if (tokens) {
      return tokens.length;
    }
    if (rows) {
      return rows.length;
    }

    return 0;
  });

  highlightedColumn = computed(() => {
    const tokens = this.highlightedTokens();
    const currentResult = this.currentResult();
    if (tokens && tokens[currentResult]) {
      return tokens[currentResult][1];
    }
    return null;
  });

  reset() {
    this.highlightedRows.set(null);
    this.highlightedTokens.set(null);
    this.currentResult.set(0);
    this.indexedResults.set(null);
  }
}
