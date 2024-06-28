import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SectionHelpComponent } from './section-help.component';
import { LayoutModule } from '@kalila-edition/common-ui';
import { TranscriptionGuidelinesComponent } from './transcription-guidelines/transcription-guidelines.component';
import { TranscriptionGuidelinesTitleComponent } from './transcription-guidelines/transcription-guidelines-title.component';

@NgModule({
  declarations: [SectionHelpComponent, TranscriptionGuidelinesComponent, TranscriptionGuidelinesTitleComponent],
  imports: [
    CommonModule,
    LayoutModule,
    RouterModule.forChild([
      {
        path: '',
        component: SectionHelpComponent,
        pathMatch: 'full',
      },
      {
        path: 'transcription-guidelines',
        title: 'KwD Edition - Transcription Guidelines',
        component: SectionHelpComponent,
        pathMatch: 'full',
        children: [
          { path: '', component: TranscriptionGuidelinesComponent, outlet: 'content' },
          { path: '', component: TranscriptionGuidelinesTitleComponent, outlet: 'title' },
        ]
      },
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
export class SectionHelpModule { }
