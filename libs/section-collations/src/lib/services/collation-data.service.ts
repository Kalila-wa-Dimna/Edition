import { Injectable } from '@angular/core';
import { IRowData } from '../models/collation-row-data.model';

@Injectable()
export class CollationDataService {
  cache: Array<IRowData | undefined> = [];

  init(length = 300) {
    this.cache = Array.from<IRowData | undefined>({
      length,
    });
  }
}
