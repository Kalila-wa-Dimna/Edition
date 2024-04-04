import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TocLeraComponent } from './toc-lera/toc-lera.component';
import { LayoutModule } from "@kalila-edition/common-ui";
import { RouterModule } from "@angular/router";
import { routes } from "./other-editions.routes";
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from "@angular/material/button-toggle";

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatButtonToggleModule,
    TocLeraComponent
    // Other imports...
  ],
  declarations: [
  ],
})

export class OtherEditionsModule {}
