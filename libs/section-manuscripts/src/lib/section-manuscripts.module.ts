import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SelectManuscriptComponent} from './select-manuscript/select-manuscript.component';
import {RouterModule} from '@angular/router';
import {routes} from './section-manuscript.routes';
import {LayoutModule} from '@kalila-edition/common-ui';
import {ManuscriptOverviewComponent} from './manuscript-overview/manuscript-overview.component';
import {ManuscriptPageComponent} from './manuscript-page/manuscript-page.component';
import {
  ManuscriptPageCommandBarComponent
} from './manuscript-page/manuscript-page-command-bar/manuscript-page-command-bar.component';
import {
  ManuscriptPageFacsimileComponent
} from './manuscript-page/manuscript-page-facsimile/manuscript-page-facsimile.component';
import {ManuscriptPageTextComponent} from './manuscript-page/manuscript-page-text/manuscript-page-text.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {FontSizeService} from './services/font-size.service';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {ManuscriptPageGalleryComponent} from './manuscript-page-gallery/manuscript-page-gallery.component';
import {
  ManuscriptPageGalleryViewerComponent
} from './manuscript-page-gallery/manuscript-page-gallery-viewer/manuscript-page-gallery-viewer.component';
import {
  ManuscriptPageGalleryCommandBarComponent
} from './manuscript-page-gallery/manuscript-page-gallery-command-bar/manuscript-page-gallery-command-bar.component';
import {ManuscriptPageService} from "./services/manuscript-page.resolver";
import { FormsModule } from '@angular/forms';
import { LightgalleryModule } from 'lightgallery/angular';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LayoutModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    FormsModule,
    LightgalleryModule

  ],
  providers: [FontSizeService, ManuscriptPageService],
  declarations: [
    SelectManuscriptComponent,
    ManuscriptOverviewComponent,
    ManuscriptPageComponent,
    ManuscriptPageCommandBarComponent,
    ManuscriptPageFacsimileComponent,
    ManuscriptPageTextComponent,
    ManuscriptPageGalleryComponent,
    ManuscriptPageGalleryViewerComponent,
    ManuscriptPageGalleryCommandBarComponent,
  ],
})
export class SectionManuscriptsModule {
}
