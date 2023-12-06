import { Component, EventEmitter, OnInit, Output, Input, computed } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { CollationSettingsService } from '../../../services/collation-settings.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import {
  parseIfIndoArabicNumber,
  parseIfNumber,
} from '../../../util/parse-if-number';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'kd-collation-command-bar',
  templateUrl: './collation-command-bar.component.html',
  styleUrls: ['./collation-command-bar.component.scss'],
})
export class CollationCommandBarComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private settingsService: CollationSettingsService,
    private searchService: SearchService,
  ) { }

  @Output() goToRow = new EventEmitter<number>();
  @Input() titles: string[] = [];

  searchControl = new FormControl('');

  showFacsimilePreview$ = this.settingsService.showFacsimilePreview$;
  showMap$ = this.settingsService.showMap$;

  numberOfResults = this.searchService.numberOfResults;


  currentResult = computed(() => {
    if (this.searchService.highlightedRows()) {
      return this.searchService.currentRow();
    }

    if (this.searchService.highlightedTokens()) {
      return this.searchService.currentCell();
    }

    return 0;
  })

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(100))
      .subscribe((value) => {

        this.searchService.reset();
        const index =
          parseIfNumber(value ?? '') ?? parseIfIndoArabicNumber(value ?? '');
        if (index && index !== 0) {
          this.goToRow.emit(index - 1);
        } else if (value) {
          const lowerCaseValue = value?.toLowerCase();
          const indexes = this.titles
            .map((title, i) => title.toLowerCase().includes(lowerCaseValue) ? i : -1)
            .filter(index => index !== -1);
          this.searchService.highlightedRows.set(indexes);
          if (indexes.length > 0) {
            this.goToRow.emit(indexes[0]);
          }
        }

      });
  }

  toggleFacsimile(value: boolean): void {
    const oldValue = this.settingsService.state$.getValue();
    if (value) {
      this.settingsService.apply({
        ...oldValue,
        showFacsimilePreview: value,
        showMap: false,
      });
    } else {
      this.settingsService.apply({
        ...oldValue,
        showFacsimilePreview: value,
      });
    }

  }

  toggleMap(value: boolean): void {
    const oldValue = this.settingsService.state$.getValue();

    if (value) {
      this.settingsService.apply({
        ...oldValue,
        showMap: value,
        showFacsimilePreview: false,
      });
    } else {
      this.settingsService.apply({
        ...oldValue,
        showMap: value,
      });
    }


  }

  nextResult(): void {
    const rows = this.searchService.highlightedRows();
    const cells = this.searchService.highlightedTokens();
    if (rows) {
      const currentRow = this.searchService.currentRow();
      if (currentRow < rows.length - 1) {
        this.goToRow.emit(rows[currentRow + 1]);
        this.searchService.currentRow.set(currentRow + 1);
      }

    }
    if (cells) {
      // TODO
    }
  }

  previousResult(): void {
    const rows = this.searchService.highlightedRows();
    const cells = this.searchService.highlightedTokens();
    if (rows) {
      const currentRow = this.searchService.currentRow();
      if (currentRow > 0) {
        this.goToRow.emit(rows[currentRow - 1]);
        this.searchService.currentRow.set(currentRow - 1);
      }
    }
    if (cells) {
      // TODO
    }
  }

  openSettingsDialog(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: this.settingsService.state$.getValue(),
      panelClass: 'responisve-dialog',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.settingsService.apply(result);
      }
    });
  }
}
