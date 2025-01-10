import { Component, Input } from '@angular/core';
import { CELL_PADDING } from '../../../constants/size.constants';
import { ICollationColumn } from '../../../models/collation-page-data.model';
import { CollationSettingsService } from '../../../services/collation-settings.service';
import { SearchService } from '../../../services/search.service';

@Component({
    selector: 'kd-collation-heading',
    templateUrl: './collation-heading.component.html',
    styleUrls: ['./collation-heading.component.scss'],
    standalone: false
})
export class CollationHeadingComponent {
  @Input() columns: ICollationColumn[] = [];

  cellPadding: number = CELL_PADDING;

  cellWidth$ = this.settingsService.cellWidth$;
  fontSize$ = this.settingsService.fontSize$;

  highlightedColumn = this.searchService.highlightedColumn;

  constructor(private settingsService: CollationSettingsService, private searchService: SearchService) { }

  mapNumberToLetter(num: number): string {
    const letters = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'.split('');
    let firstLetter = '';
    let secondLetter = '';

    if (num < letters.length) {
      return letters[num];
    } else {
      num -= letters.length; // Adjust number to start from 0 for the two-letter system
      firstLetter = letters[Math.floor(num / letters.length)];
      secondLetter = letters[num % letters.length];
      return firstLetter + secondLetter;
    }
  }
}
