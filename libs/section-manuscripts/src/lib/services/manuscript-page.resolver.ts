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
    const api = inject(DataService);
    const id = route.paramMap.get('id');
    const chapter = route.paramMap.get('chapter');
    const pageNumber = route.paramMap.get('pageNumber');
    const url = api.load<any>(`manuscripts/${id}/${chapter}/${pageNumber}`, {});

    return url; // Load data using DataService
  };

  return resolve; // Return the resolver function
}




export function createChapterToMsDataResolver() {
  const resolve: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const api = inject(DataService);
    const chapter=route.paramMap.get('chapter')
    // Construct the correct URL string
    const url = `manuscripts/chapter_to_ms/${chapter}`;
    // Load data using DataService and return an Observable
    return api.load<any>(url, {}).pipe(
      map((data) => {
        return data;
      })
    );
  };

  return resolve; // Return the resolver function
}

export function createManuscriptChaptersDataResolver() {
  const resolve: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const api = inject(DataService);
    const id = route.paramMap.get('id');
    const url = `manuscripts/${id}/allChapters`;
    return api.load<any>(url, {}).pipe(
      map((data) => {
        return data;
      })
    );
  };

  return resolve; // Return the resolver function
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


export function createAllPagesResolver() {
  const resolve: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const api = inject(DataService);
    const id = route.paramMap.get('id');

    // Construct the correct URL string
    const url = `manuscripts/${id}/allPages`;
    // Load data using DataService and return an Observable
    return api.load<any>(url, {}).pipe(
      map((data) => {
        return data;
      })
    );
  };

  return resolve; // Return the resolver function
}


export function createChapterThatAllMsHaveDataResolver() {
  const resolve: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const api = inject(DataService);

    // Construct the correct URL string
    const url = `manuscripts/chapter_to_ms/Lv`;

    // Load data using DataService and return an Observable
    return api.load<any>(url, {}).pipe(
      map((data) => {
        return data;
      })
    );
  };

  return resolve; // Return the resolver function
}
