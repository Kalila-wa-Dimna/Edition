import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavPanelComponent } from './layout/nav-panel/nav-panel.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { FooterModule } from './footer.module';
import { CollationsPanelComponent } from './layout/nav-panel/collations-panel/collations-panel.component';
import { ManuscriptsPanelComponent } from './layout/nav-panel/manuscripts-panel/manuscripts-panel.component';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    FooterModule,
    MatExpansionModule,
    MatDividerModule,
    HttpClientModule,
    MatCardModule,
    MatMenuModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  declarations: [
    LayoutComponent,
    NavPanelComponent,
    CollationsPanelComponent,
    ManuscriptsPanelComponent,
  ],
  exports: [LayoutComponent],
  providers: [],
})
export class LayoutModule {}
