import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';
import { combineLatest, map } from 'rxjs';

export function createCollationDataResolver() {
  const resolve: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    console.log({ route });
    console.log({ state });
    const api = inject(DataService);
    const editionSiglum = route.paramMap.get('editionSiglum')!;

    const meta = api.load<any>(`collations/${editionSiglum}/meta`, {});
    const units = api.load<any>(`collations/${editionSiglum}/units`, {});
    const firstTenRows = api.load<any>(
      `collations/${editionSiglum}/0_to_9`,
      {}
    );
    return combineLatest([meta, units, firstTenRows]).pipe(
      map(([meta, units, firstTenRows]) => ({ meta, units, firstTenRows }))
    );
  };

  return resolve;
}
