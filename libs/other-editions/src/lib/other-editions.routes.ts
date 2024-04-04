import { Route } from '@angular/router';
import { TocLeraComponent } from './toc-lera/toc-lera.component';
import {createResolver} from "@kalila-edition/common-ui";
export const routes: Route[] = [
  // select
  {
    path: '',
    component: TocLeraComponent,
    pathMatch: 'full',
    title: 'toc-lera',
    resolve: {
      manuscriptList: createResolver<any>('manuscripts/manuscriptDescriptionAll', []),
    },
  },
]
