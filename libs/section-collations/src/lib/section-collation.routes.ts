import { Route } from '@angular/router';
import { createResolver } from '@kalila-edition/common-ui';
import { CollationComponent } from './components/collation/collation.component';
import { SelectCollationComponent } from './components/select-collation/select-collation.component';
import { ICollationInfo } from './models/collation-summary.model';
import { createCollationDataResolver } from './services/collation-page.resolver';

export const routes: Route[] = [
  // select
  {
    path: '',
    component: SelectCollationComponent,
    pathMatch: 'full',
    title: 'Select Collation',
    resolve: {
      collationsList: createResolver<ICollationInfo[]>('collations/all', []),
    },
  },
  // collation page
  {
    path: ':editionSiglum',
    component: CollationComponent,
    resolve: {
      pageData: createCollationDataResolver(),
    },
  },
];
