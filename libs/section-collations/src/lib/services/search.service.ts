import { Injectable, computed, signal } from '@angular/core';

@Injectable()
export class SearchService {

  highlightedRows = signal<number[] | null>(null);

  highlightedTokens = signal<[number, number, number, number][][] | null>(null); // [startLine, startToken, endLine, endToken] = array[row][cell]

  currentRow = signal<number>(0);

  currentCell = signal<number>(0);

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

  reset() {
    this.highlightedRows.set(null);
    this.highlightedTokens.set(null);
    this.currentRow.set(0);
    this.currentCell.set(0);
  }

}
