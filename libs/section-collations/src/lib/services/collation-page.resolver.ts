import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';
import { combineLatest, map } from 'rxjs';

export function createCollationDataResolver() {
  const resolve: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const api = inject(DataService);
    const slug = route.paramMap.get('slug')!;

    const meta = api.load<any>(`collations/${slug}/meta`, {});
    const units = api.load<any>(`collations/${slug}/units`, {});
    const firstTenRows = api.load<any>(`collations/${slug}/0_to_9`, {});
    return combineLatest([meta, units, firstTenRows]).pipe(
      map(([meta, units, firstTenRows]) => ({ meta, units, firstTenRows }))
    );
  };

  return resolve;
}
