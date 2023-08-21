import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SectionHelpComponent } from './section-help.component';
import { LayoutModule } from '@kalila-edition/common-ui';

@NgModule({
  declarations: [SectionHelpComponent],
  imports: [
    CommonModule,
    LayoutModule,
    RouterModule.forChild([
      { path: '', component: SectionHelpComponent },
      {
        path: 'dissemination-history',
        loadChildren: () =>
          import('@kalila-edition/dissemination-history').then(
            (m) => m.DisseminationHistoryModule
          ),
      },
    ]),
  ],
})
export class SectionHelpModule {}
