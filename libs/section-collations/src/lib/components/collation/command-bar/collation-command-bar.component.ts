import { Component, EventEmitter, OnInit, Output, Input, OnDestroy, Inject, PLATFORM_ID, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { CollationSettingsService } from '../../../services/collation-settings.service';
import { FormControl } from '@angular/forms';
import { Subscription, debounceTime } from 'rxjs';
import {
  parseIfIndoArabicNumber,
  parseIfNumber,
} from '../../../util/parse-if-number';
import { SearchService } from '../../../services/search.service';
import { SearchWorkerService } from '@kalila-edition/common-ui';
import { arabicLettersRegex, latinLettersRegex } from '@kalila-edition/common-util';
import { isPlatformBrowser } from '@angular/common';
import { DownloadsService } from '../../../services/downloads.service';

@Component({
    selector: 'kd-collation-command-bar',
    templateUrl: './collation-command-bar.component.html',
    styleUrls: ['./collation-command-bar.component.scss'],
    standalone: false
})
export class CollationCommandBarComponent implements OnInit, OnDestroy {
  constructor(
    public dialog: MatDialog,
    private settingsService: CollationSettingsService,
    private searchService: SearchService,
    private searchWorkerService: SearchWorkerService,
    private downloadsService: DownloadsService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  @Output() goToRow = new EventEmitter<number>();
  @Input() titles: string[] = [];
  @Input() collationName = '';

  searchControl = new FormControl('');

  showFacsimilePreview$ = this.settingsService.showFacsimilePreview$;
  showMap$ = this.settingsService.showMap$;

  numberOfResults = this.searchService.numberOfResults;

  sub1 = Subscription.EMPTY;
  sub2 = Subscription.EMPTY;

  currentResult = this.searchService.currentResult;
  showMobileSearchPanel = signal<boolean>(false);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.sub1 = this.searchControl.valueChanges
        .pipe(debounceTime(100))
        .subscribe((value) => {
          this.searchService.reset();
          const index =
            parseIfNumber(value ?? '') ?? parseIfIndoArabicNumber(value ?? '');
          if (index && index !== 0) {
            this.goToRow.emit(index - 1);
          } else if (value && value.length > 1) {
            if (latinLettersRegex.test(value)) {
              const lowerCaseValue = value?.toLowerCase();
              const indexes = this.titles
                .map((title, i) => title.toLowerCase().includes(lowerCaseValue) ? i : -1)
                .filter(index => index !== -1);
              this.searchService.highlightedRows.set(indexes);
              if (indexes.length > 0) {
                this.goToRow.emit(indexes[0]);
              }
            } else if (arabicLettersRegex.test(value)) {
              this.searchWorkerService.search(value, this.collationName);
            } else {
              this.searchService.reset();
            }

          } else {
            this.searchService.reset();
          }

        });

      this.sub2 = this.searchWorkerService.searchResults$.subscribe((data) => {

        if (data) {
          const { sentence, collationName, results, indexedResults } = data;
          if (sentence === this.searchControl.value && collationName === this.collationName) {
            this.searchService.currentResult.set(results.length - 1);
            this.searchService.highlightedTokens.set(results);

            this.searchService.indexedResults.set(indexedResults);

            if (results.length > 0) {
              setTimeout(() => {
                this.searchService.currentResult.set(0);
                this.goToRow.emit(results[0][0]);
              }, 10)

            }
          }
        }

      })
    }

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

  async downloadUnitTable() {
    await this.downloadsService.downloadUnitTable();
  }

  toggleMobileSearchPanel(): void {
    const oldValue = this.showMobileSearchPanel();
    this.showMobileSearchPanel.set(!oldValue);
    if (oldValue) { this.searchControl.setValue(''); }
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
    const currentResult = this.searchService.currentResult();
    if (rows) {
      if (currentResult < rows.length - 1) {
        this.goToRow.emit(rows[currentResult + 1]);
        this.searchService.currentResult.set(currentResult + 1);
      }
    }
    if (cells) {
      if (currentResult < cells.length - 1) {
        this.goToRow.emit(cells[currentResult + 1][0]);
        this.searchService.currentResult.set(currentResult + 1);
      }
    }
  }

  previousResult(): void {
    const rows = this.searchService.highlightedRows();
    const cells = this.searchService.highlightedTokens();
    const currentResult = this.searchService.currentResult();
    if (rows) {
      if (currentResult > 0) {
        this.goToRow.emit(rows[currentResult - 1]);
        this.searchService.currentResult.set(currentResult - 1);
      }
    }
    if (cells) {
      if (currentResult > 0) {
        this.goToRow.emit(cells[currentResult - 1][0]);
        this.searchService.currentResult.set(currentResult - 1);
      }
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

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }
}
