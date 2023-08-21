import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';
import { combineLatest, map } from 'rxjs';
import {
  ICollationColumn,
  ICollationPageData,
  ICollationUnit,
} from '../models/collation-page-data.model';
import { ICollationInfo } from '../models/collation-summary.model';
import { IRowData } from '../models/collation-row-data.model';

export function createCollationDataResolver() {
  const resolve: ResolveFn<ICollationPageData> = (
    route: ActivatedRouteSnapshot
  ) => {
    const api = inject(DataService);
    const editionSiglum = route.paramMap.get('collationSiglum')!;

    const columns$ = api.load<ICollationColumn[]>(
      `collations/${editionSiglum}/columns`,
      []
    );
    const units$ = api.load<ICollationUnit[]>(
      `collations/${editionSiglum}/units`,
      []
    );

    const summary$ = api.load<ICollationInfo>(
      `collations/${editionSiglum}/summary`,
      { siglum: '', display: '', image: '' }
    );

    const segmentData$ = api.load<IRowData[]>(
      `collations/${editionSiglum}/segment_data`,
      []
    );

    return combineLatest([columns$, units$, summary$, segmentData$]).pipe(
      map(([columns, units, summary, segmentData]) => ({
        columns,
        units,
        summary,
        segmentData,
      }))
    );
  };

  return resolve;
}
