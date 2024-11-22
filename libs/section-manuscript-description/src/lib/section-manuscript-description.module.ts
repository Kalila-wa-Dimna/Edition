import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview/overview.component';
import {LayoutModule} from "@kalila-edition/common-ui";
import {RouterModule} from "@angular/router";
import {routes} from "./section-manuscript-description.routes";
import { MatTableModule } from '@angular/material/table';
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {SinglePageComponent} from "./single-page/single-page.component";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReplacePipe } from './single-page/replace.pipe';
import {GraphComponent} from "./graph/graph.component";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, LayoutModule,
    RouterModule.forChild(routes),
    MatTableModule, MatButtonToggleModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    FormsModule,


  ],
  declarations: [
    OverviewComponent,
    SinglePageComponent,
    ReplacePipe,
    GraphComponent
  ],
})
export class SectionManuscriptDescriptionModule {

}
