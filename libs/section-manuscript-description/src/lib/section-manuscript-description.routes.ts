import { Route } from '@angular/router';
import {
  OverviewComponent
} from "././overview/overview.component";
import {createResolver} from "@kalila-edition/common-ui";
import {ManuscriptPageComponent} from "../../../section-manuscripts/src/lib/manuscript-page/manuscript-page.component";
import {
  createAllEnglishPagesResolver,
  createAllPagesResolver,
  createManuscriptChaptersDataResolver,
  createManuscriptDataResolver
} from "../../../section-manuscripts/src/lib/services/manuscript-page.resolver";
import {createManuscriptDescriptionDataResolver} from "./services/manuscripts-description-page.resolver";
import {SinglePageComponent} from "./single-page/single-page.component";
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

  {
    path: ':id',
    component: SinglePageComponent,
    pathMatch: 'full',
    resolve: {
      manuscriptDescriptionData: createManuscriptDescriptionDataResolver(),

    },
  }

]
