import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';

export function createGalleryDataResolver() {
  const resolve: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {

    const api = inject(DataService);
    const id = route.paramMap.get('id');
    const url = api.load<any>(`manuscripts/${id}/gallery`, {});

    return url; // Load data using DataService
  };

  return resolve; // Return the resolver function
}
