import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';
import { map, tap } from 'rxjs';
import { Observable } from 'rxjs';

// Define interfaces
export interface Node {
  id: string;           // unique identifier of the node (e.g., manuscript name)
  label: string;        // label to display
  century: string;      // century of the manuscript
  incoming?: string[];  // optional array of incoming edges
  outgoing?: string[];  // optional array of outgoing edges
}


export interface Edge {
  from: string;         // the source manuscript id
  to: string;           // the related manuscript id
}

// Define the structure of the entire graph data
export interface GraphData {
  nodes: Node[];        // list of all nodes (manuscripts)
  edges: Edge[];        // list of all edges (relationships between manuscripts)
}

// Normalize and standardize IDs
const normalizeId = (id: string): string => {
  let normalizedId = id.trim().toLowerCase();
  // Ensure the ID starts with "ms"
  if (!normalizedId.startsWith('ms')) {
    normalizedId = `ms${normalizedId}`;
  }
  return normalizedId;
};

// Create a resolver function for manuscript description data
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

// Create a resolver function to fetch and transform graph data
export function createGraphDataResolver(): ResolveFn<GraphData> {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const api = inject(DataService);
    const url = `manuscripts/ms_descptions/graph`;

    return api.load<any>(url, {}).pipe(
      tap(data => console.log('Raw API data:', data)) // Log the raw data
    );
  };
}

// Transform raw data into the GraphData format
function transformDataToGraph(data: any): GraphData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeIdSet = new Set<string>();

  // Add all nodes
  Object.keys(data).forEach(century => {
    const manuscripts = data[century];
    manuscripts.forEach((manuscript: any) => {
      const normalizedId = normalizeId(manuscript.manuscript);
      nodes.push({
        id: normalizedId,
        label: manuscript.manuscript,
        century: century,
        incoming: [], // Ensure these are initialized as empty arrays
        outgoing: []   // Ensure these are initialized as empty arrays
      });
      nodeIdSet.add(normalizedId);
    });
  });

  // Process edges
  Object.keys(data).forEach(century => {
    const manuscripts = data[century];
    manuscripts.forEach((manuscript: any) => {
      const normalizedId = normalizeId(manuscript.manuscript);
      if (Array.isArray(manuscript.related_manuscripts)) {
        manuscript.related_manuscripts.forEach((related: string) => {
          const normalizedRelated = normalizeId(related);
          if (nodeIdSet.has(normalizedRelated)) {
            edges.push({
              from: normalizedId,
              to: normalizedRelated
            });
            // Update incoming and outgoing references
            const sourceNode = nodes.find(node => node.id === normalizedId);
            const targetNode = nodes.find(node => node.id === normalizedRelated);
            if (sourceNode && targetNode) {
              // Ensure outgoing and incoming are being referenced correctly
              sourceNode.outgoing = sourceNode.outgoing || [];
              sourceNode.outgoing.push(normalizedRelated);

              targetNode.incoming = targetNode.incoming || [];
              targetNode.incoming.push(normalizedId);

            }
          } else {
            console.warn(`Edge references non-existent node: ${related}`);
          }
        });
      }
    });
  });

  console.log('Transformed Nodes:', nodes);
  console.log('Transformed Edges:', edges);

  return { nodes, edges };
}
