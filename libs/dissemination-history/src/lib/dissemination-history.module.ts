import { DisseminationHistoryService } from './dissemination-history.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@kalila-edition/common-ui';
import { DisseminationHistoryComponent } from './dissemination-history.component';
import { RouterModule } from '@angular/router';
import { DisseminationHistoryMapComponent } from './dissemination-history-map/dissemination-history-map.component';
import { DisseminationHistoryTextComponent } from './dissemination-history-text/dissemination-history-text.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    DisseminationHistoryComponent,
    DisseminationHistoryMapComponent,
    DisseminationHistoryTextComponent,
  ],
  imports: [
    CommonModule,
    LayoutModule,
    MatButtonModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatCardModule,
    RouterModule.forChild([
      {
        path: '',
        component: DisseminationHistoryComponent,
        title: 'Kalīla wa-Dimna Dissemination History',
      },
    ]),
  ],
  providers: [DisseminationHistoryService],
})
export class DisseminationHistoryModule {}
