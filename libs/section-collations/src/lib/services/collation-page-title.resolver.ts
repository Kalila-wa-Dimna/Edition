import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';
import { map } from 'rxjs';
import { ICollationInfo } from '../models/collation-summary.model';

export function createCollationDataTitleResolver() {
  const resolve: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
    const api = inject(DataService);
    const editionSiglum = route.paramMap.get('collationSiglum')!;

    const summary = api.load<ICollationInfo>(
      `collations/${editionSiglum}/summary`,
      { siglum: '', display: '', image: '', key: '' }
    );

    return summary.pipe(map((s) => s.display));
  };

  return resolve;
}
