import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectCollationComponent } from './components/select-collation/select-collation.component';
import { RouterModule } from '@angular/router';
import { LayoutModule, RenderHelpersModule } from '@kalila-edition/common-ui';
import { CollationComponent } from './components/collation/collation.component';
import { MatCardModule } from '@angular/material/card';
import { CollationDataService } from './services/collation-data.service';
import { CollationCommandBarComponent } from './components/collation/command-bar/collation-command-bar.component';
import { routes } from './section-collation.routes';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CollationHeadingComponent } from './components/collation/collation-heading/collation-heading.component';
import { CollationRowComponent } from './components/collation/collation-row/collation-row.component';
import { CollationCellComponent } from './components/collation/collation-row/collation-cell/collation-cell.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CollationSettingsService } from './services/collation-settings.service';
import { MatDialogModule } from '@angular/material/dialog';
import { SettingsDialogComponent } from './components/collation/command-bar/settings-dialog/settings-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CellSizingService } from './services/cell-sizing.service';
import { CollationVirtualScrollDirective } from './directives/virtual-scroll/collation-virtual-scroll.directive';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SearchService } from './services/search.service';
import { FacsimilePanelComponent } from './components/collation/facsimile-panel/facsimile-panel.component';
import { FacsimilePanelService } from './services/facsimile-panel.service';
import { FacsimilePanelCommandBarComponent } from './components/collation/facsimile-panel/facsimile-panel-command-bar/facsimile-panel-command-bar.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MapPanelComponent } from './components/collation/map-panel/map-panel.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';



@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonToggleModule,
    ScrollingModule,
    RenderHelpersModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatDividerModule,
    MatInputModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  declarations: [
    SelectCollationComponent,
    CollationComponent,
    CollationCommandBarComponent,
    CollationHeadingComponent,
    CollationRowComponent,
    CollationCellComponent,
    SettingsDialogComponent,
    CollationVirtualScrollDirective,
    FacsimilePanelComponent,
    FacsimilePanelCommandBarComponent,
    MapPanelComponent,
  ],
  providers: [
    CollationDataService,
    CollationSettingsService,
    CellSizingService,
    SearchService,
    FacsimilePanelService,
  ],
})
export class SectionCollationsModule { }
