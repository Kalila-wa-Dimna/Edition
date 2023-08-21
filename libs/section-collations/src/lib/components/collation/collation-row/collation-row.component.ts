import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ICollationUnit } from '../../../models/collation-page-data.model';
import { CELL_PADDING } from '../../../constants/cell-width.constants';
import { CollationSettingsService } from '../../../services/collation-settings.service';
import { IRowData } from '../../../models/collation-row-data.model';

@Component({
  selector: 'kd-collation-row',
  templateUrl: './collation-row.component.html',
  styleUrls: ['./collation-row.component.scss'],
})
export class CollationRowComponent {
  @Input() unit!: ICollationUnit;
  @Input() sigla: string[] = [];

  @Input()
  rowData?: IRowData | undefined;

  cellWidth$ = this.settingsService.cellWidth$;

  cellPadding = CELL_PADDING;

  @ViewChild('content') content?: ElementRef;
  @ViewChild('header') header?: ElementRef;

  constructor(private settingsService: CollationSettingsService) {}

  // debugStickyElement(element: ElementRef): void {
  //   let parent = this.renderer.parentNode(element.nativeElement);

  //   while (parent) {
  //     const hasOverflow = window.getComputedStyle(parent).overflow;
  //     console.log(hasOverflow, parent);
  //     parent = this.renderer.parentNode(parent);
  //   }
  // }
}
