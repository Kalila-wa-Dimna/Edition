import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview/overview.component';
import {LayoutModule} from "@kalila-edition/common-ui";
import {RouterModule} from "@angular/router";
import {routes} from "./section-manuscript-description.routes";
import { MatTableModule } from '@angular/material/table';
@NgModule({
  imports: [CommonModule, LayoutModule,
    RouterModule.forChild(routes),
    MatTableModule
  ],
  declarations: [OverviewComponent],
})
export class SectionManuscriptDescriptionModule {}
