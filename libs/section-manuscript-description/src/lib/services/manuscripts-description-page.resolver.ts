import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';
import { map } from 'rxjs';
import { Observable, of } from 'rxjs';

export function createManuscriptDescriptionDataResolver() {
  const resolve: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const api = inject(DataService);
    const id = route.paramMap.get('id');
    const url = `manuscripts/individual_manuscripts_description/${id}`;

    return api.load<any>(url, {}).pipe(
      map((data) => {
        return data;
      })
    );
  };



  return resolve; // Return the resolver function
}
