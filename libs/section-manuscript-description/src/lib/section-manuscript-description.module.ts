import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview/overview.component';
import {LayoutModule} from "@kalila-edition/common-ui";
import {RouterModule} from "@angular/router";
import {routes} from "./section-manuscript-description.routes";
import { MatTableModule } from '@angular/material/table';
import {MatButtonToggleModule} from "@angular/material/button-toggle";

@NgModule({
  imports: [CommonModule, LayoutModule,
    RouterModule.forChild(routes),
    MatTableModule, MatButtonToggleModule,

  ],
  declarations: [OverviewComponent],
})
export class SectionManuscriptDescriptionModule {}
