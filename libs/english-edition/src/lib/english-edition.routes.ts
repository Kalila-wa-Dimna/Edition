import { Route } from '@angular/router';
import { McEngLeraComponent } from './Mc-Eng-Lera/Mc-Eng-Lera.component';
import { createResolver } from '@kalila-edition/common-ui';

export const routes: Route[] = [
  {
    path: '',
    component: McEngLeraComponent, // Standalone component
    pathMatch: 'full',
    title: 'mceng',
    resolve: {
      manuscriptList: createResolver<any>('manuscripts/manuscriptDescriptionAll', []),
    },
  },
];
