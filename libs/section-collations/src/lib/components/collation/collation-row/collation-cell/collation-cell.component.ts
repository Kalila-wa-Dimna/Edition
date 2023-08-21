import { Component, Input } from '@angular/core';
import { ICellData } from '../../../../models/collation-row-data.model';

@Component({
  selector: 'kd-collation-cell',
  templateUrl: './collation-cell.component.html',
  styleUrls: ['./collation-cell.component.scss'],
})
export class CollationCellComponent {
  @Input() data?: ICellData;
}
