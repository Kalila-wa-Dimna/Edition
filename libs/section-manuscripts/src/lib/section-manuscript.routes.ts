import { Route } from '@angular/router';
import {SelectManuscriptComponent} from "./select-manuscript/select-manuscript.component";
import {createResolver} from "@kalila-edition/common-ui";
import {ManuscriptOverviewComponent} from "./manuscript-overview/manuscript-overview.component";
import {ManuscriptPageComponent} from "./manuscript-page/manuscript-page.component";
import {
  ManuscriptPageCommandBarComponent
} from "./manuscript-page/manuscript-page-command-bar/manuscript-page-command-bar.component";
import {ManuscriptPageTextComponent} from "./manuscript-page/manuscript-page-text/manuscript-page-text.component";
import {
  ManuscriptPageFacsimileComponent
} from "./manuscript-page/manuscript-page-facsimile/manuscript-page-facsimile.component";
import {createAllPagesResolver, createChapterToMsDataResolver,createChapterThatAllMsHaveDataResolver,createManuscriptChaptersDataResolver} from "./services/manuscript-page.resolver";
import {createManuscriptDataResolver } from "./services/manuscript-page.resolver";

import {createGalleryDataResolver} from "./services/manuscript-gallery.resolver";

import {
  ManuscriptPageGalleryComponent
} from "./manuscript-page-gallery/manuscript-page-gallery.component"
import {
  ManuscriptPageGalleryViewerComponent
} from "./manuscript-page-gallery/manuscript-page-gallery-viewer/manuscript-page-gallery-viewer.component"
import {
  ManuscriptPageGalleryCommandBarComponent
} from "./manuscript-page-gallery/manuscript-page-gallery-command-bar/manuscript-page-gallery-command-bar.component"
export const routes: Route[] = [
    // select
    {
        path: '',
        component: SelectManuscriptComponent,
        pathMatch: 'full',
        title: 'Select Manuscript',
        resolve: {
            manuscriptList: createResolver<any>('manuscripts/all', []),
        },
    },
    // manuscript
  {
    path: ':id',
    component: ManuscriptOverviewComponent,
    pathMatch: 'full',

  },

  {
    path: ':id/gallery', // Adjust the path as needed
    component: ManuscriptPageGalleryComponent,
    pathMatch: 'full',
    resolve: {
      galleryData: createGalleryDataResolver(),
      manuscriptsInfo: createResolver<any>('manuscripts/all', [])
    },
  children: [
  {
    path: '',
    component: ManuscriptPageGalleryCommandBarComponent,
    outlet: 'command',
  },
    {
      path: '',
      component: ManuscriptPageGalleryViewerComponent,
      outlet: 'viewer',
    },]

  }
,
  // page
  {
    path: ':id/:chapter/:pageNumber',
    component: ManuscriptPageComponent,
    pathMatch: 'full',
    resolve: {
      pageData: createManuscriptDataResolver(),
      chapterToMsData:createChapterToMsDataResolver(),
      chapterThatAllMsHave:createChapterThatAllMsHaveDataResolver(),
      manuscriptChaptersData:createManuscriptChaptersDataResolver(),
      allPagesData:createAllPagesResolver()
    },
    children: [
      {
        path: '',
        component: ManuscriptPageCommandBarComponent,
        outlet: 'command',
      },
      {
        path: '',
        component: ManuscriptPageTextComponent,
        outlet: 'text',
      },
      {
        path: '',
        component: ManuscriptPageFacsimileComponent,
        outlet: 'facsimile',
      }
    ]
  },
  { path: '', component: ManuscriptPageComponent, runGuardsAndResolvers: 'always' },

];
