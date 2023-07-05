import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectCollationComponent } from './components/select-collation/select-collation.component';
import { RouterModule } from '@angular/router';
import { NavbarModule } from '@kalila-edition/common-ui';
import { CollationComponent } from './components/collation/collation.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CollationDataService } from './services/collation-data.service';
import { CollationCommandBarComponent } from './components/collation/command-bar/collation-command-bar.component';
import { routes } from './section-collation.routes';

@NgModule({
  imports: [
    CommonModule,
    NavbarModule,
    RouterModule.forChild(routes),
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
