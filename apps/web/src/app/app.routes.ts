import { Route } from '@angular/router';
import { MainPageComponent } from './main-page.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainPageComponent,
    pathMatch: 'full',
  },
  {
    path: 'collations',
    loadChildren: () =>
      import('@kalila-edition/section-collations').then(
        (m) => m.SectionCollationsModule
      ),
  },
  {
    path: 'manuscripts',
    loadChildren: () =>
      import('@kalila-edition/section-manuscripts').then(
        (m) => m.SectionManuscriptsModule
      ),
  },
];
