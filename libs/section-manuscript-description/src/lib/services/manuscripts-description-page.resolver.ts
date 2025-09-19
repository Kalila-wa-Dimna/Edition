import { inject,  } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';
import { map } from 'rxjs/operators';
import { Observable,catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

export function createGraphDataResolver(): ResolveFn<GraphData | {}> {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const http = inject(HttpClient);
    return http.get<GraphData>('assets/graph_data.json').pipe(
      map(data => {
        console.log('Loaded graph data from local file:', data);
        return data;
      }),
      catchError(error => {
        console.error('Error loading local graph data:', error);
        return of({});
      })
    );
  };
}


