import { Component, Input } from '@angular/core';
import { ICollationUnit } from '../../../models/collation-page-data.model';
import { CELL_PADDING } from '../../../constants/size.constants';
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
  @Input() searchResult: boolean = false;
  @Input() currentResult: boolean = false;
  @Input() highlighlightedTokens: [number, number, number, number][] = [];

  @Input()
  rowData?: IRowData | undefined;

  cellWidth$ = this.settingsService.cellWidth$;

  cellPadding = CELL_PADDING;


  constructor(private settingsService: CollationSettingsService) { }


}
