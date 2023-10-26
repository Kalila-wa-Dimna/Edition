import { Route } from '@angular/router';
import {
  OverviewComponent
} from "././overview/overview.component";
import {createResolver} from "@kalila-edition/common-ui";
export const routes: Route[] = [
  // select
  {
    path: '',
    component: OverviewComponent,
    pathMatch: 'full',
    title: 'manuscript-description',
    resolve: {
      manuscriptList: createResolver<any>('manuscripts/manuscriptDescriptionAll', []),
    },
  },
]
