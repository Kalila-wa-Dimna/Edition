import { Route } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { createResolver } from '@kalila-edition/common-ui';
import { GraphComponent } from './graph/graph.component';
import { SinglePageComponent } from './single-page/single-page.component';
import { createGraphDataResolver } from './services/manuscripts-description-page.resolver';
import { createManuscriptDescriptionDataResolver } from './services/manuscripts-description-page.resolver';

export const routes: Route[] = [
  // Default route: OverviewComponent
  {
    path: '',
    component: OverviewComponent,
    pathMatch: 'full',
    title: 'manuscript-description',
    resolve: {
      manuscriptList: createResolver<any>('manuscripts/manuscriptDescriptionAll', []),
    },
  },

 
  {
    path: 'graph',
    component: GraphComponent,
    pathMatch: 'full',
    resolve: {
      graphData: createGraphDataResolver(),
    },
  },

 
  {
    path: ':id',
    component: SinglePageComponent,
    pathMatch: 'full',
    resolve: {
      manuscriptDescriptionData: createManuscriptDescriptionDataResolver(),
    },
  },
];
