import { Route } from '@angular/router';
import { MainPageComponent } from './main-page.component';
import { AboutPageComponent } from './about-page.component';
import { ImprintPageComponent } from './imprint-page.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainPageComponent,
    pathMatch: 'full',
  },
  {
    path: 'about',
    component: AboutPageComponent,
    pathMatch: 'full',
  },
  {
    path: 'imprint',
    component: ImprintPageComponent,
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
  {
    path: 'guides',
    loadChildren: () =>
      import('@kalila-edition/section-help').then((m) => m.SectionHelpModule),
  },
  {
    path: 'description',
    loadChildren: () =>
      import('@kalila-edition/section-manuscript-description').then((m) => m.SectionManuscriptDescriptionModule),
  },

];
