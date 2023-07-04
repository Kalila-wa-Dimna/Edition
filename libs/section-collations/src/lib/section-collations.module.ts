import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectCollationComponent } from './components/select-collation/select-collation.component';
import { RouterModule } from '@angular/router';
import { NavbarModule, createResolver } from '@kalila-edition/common-ui';
import { ICollationInfo } from './models/collation-summary.model';
import { CollationComponent } from './components/collation/collation.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CollationDataService } from './services/collation-data.service';
import { createCollationDataResolver } from './services/collation-page.resolver';
import { CollationCommandBarComponent } from './components/collation/command-bar/collation-command-bar.component';

@NgModule({
  imports: [
    CommonModule,
    NavbarModule,
    RouterModule.forChild([
      // select
      {
        path: '',
        component: SelectCollationComponent,
        pathMatch: 'full',
        title: 'Select Collation',
        resolve: {
          data: createResolver<ICollationInfo[]>('collations/all', []),
        },
      },
      // collation page
      {
        path: ':slug',
        component: CollationComponent,
        resolve: {
          data: createCollationDataResolver(),
        },
      },
    ]),
    MatCardModule,
    MatButtonModule,
  ],
  declarations: [
    SelectCollationComponent,
    CollationComponent,
    CollationCommandBarComponent,
  ],
  providers: [CollationDataService],
})
export class SectionCollationsModule {}
