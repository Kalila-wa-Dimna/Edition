import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@kalila-edition/common-ui';
import { RouterModule } from '@angular/router';
import { routes } from './english-edition.routes';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatButtonToggleModule,
  ],
  exports: [RouterModule],
})
export class EnglishEditionModule {}
