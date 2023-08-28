import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';
import { map } from 'rxjs';
import { Observable, of } from 'rxjs';

export function createManuscriptDataResolver() {
  const resolve: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    //console.log('router', { route });
    //console.log('state', { state });
    const api = inject(DataService);
    const id = route.paramMap.get('id');
    const chapter = route.paramMap.get('chapter');
    const pageNumber = route.paramMap.get('pageNumber');
    const url = api.load<any>(`manuscripts/${id}/${chapter}/${pageNumber}`, {});

    return url; // Load data using DataService
  };

  return resolve; // Return the resolver function
}

export function createUnitsDataResolver() {
  const resolve: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const api = inject(DataService);
    const id = route.paramMap.get('id');
    const chapter = route.paramMap.get('chapter');
    const url = api.load<any>(`manuscripts/${id}/${chapter}/allUnit`, {});
    return url;
  };
  return resolve;
}

export class ManuscriptPageService {
  fetchData(
    id: string,
    chapter: string,
    pageNumber: string
  ): Observable<string> {
    // Simulate API call or data fetching here
    const data = `Manuscript ID: ${id}, Chapter: ${chapter}, Page Number: ${pageNumber}`;
    return of(data); // Simulate an observable response
  }
}
