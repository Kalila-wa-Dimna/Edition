import { inject,  } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';
import { map } from 'rxjs/operators';
import { Observable,catchError, of } from 'rxjs';

// Define interfaces for Graph Data
export interface Node {
  id: string;
  label: string;
  century: string;
  incoming?: string[];
  outgoing?: string[];
  name?: string;
}

export interface Edge {
  from: string;
  to: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

// Resolver for individual manuscript description data
export function createManuscriptDescriptionDataResolver(): ResolveFn<any> {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const api = inject(DataService);
    const id = route.paramMap.get('id');
    const url = `manuscripts/individual_manuscripts_description/${id}`;

    return api.load<any>(url, {}).pipe(
      map(data => data)
    );
  };
}

// Resolver for graph data
// Resolver for graph data
// Resolver for graph data
// Resolver for graph data
export function createGraphDataResolver(): ResolveFn<any> {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const api = inject(DataService);
    const url = `manuscripts/ms_descptions/graph`;

    return api.load<any>(url, {}).pipe(
      map(data => {
        // Log the response data for debugging
        console.log('Graph data loaded:', data);
        return data; // Return the data directly
      }),
      catchError(error => {
        console.error('Error loading graph data:', error);
        return of({}); // Return an empty object or any fallback value
      })
    );
  };

}


