import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
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
import {
  hasArabicLetters,
  isLatinTitleQuery,
  normalizeArabic,
} from '@kalila-edition/common-util';
import { isPlatformBrowser } from '@angular/common';
import { DownloadsService } from '../../../services/downloads.service';

@Component({
  selector: 'kd-collation-command-bar',
  templateUrl: './collation-command-bar.component.html',
  styleUrls: ['./collation-command-bar.component.scss'],
  standalone: false,
})
export class CollationCommandBarComponent implements OnInit, OnDestroy {
  constructor(
    public dialog: MatDialog,
    private settingsService: CollationSettingsService,
    private searchService: SearchService,
    private searchWorkerService: SearchWorkerService,
    private downloadsService: DownloadsService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  @Output() goToRow = new EventEmitter<number>();
  @Input() titles: string[] = [];
  @Input() collationKey = '';

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
          const raw = (value ?? '').trim();
          const index =
            parseIfNumber(raw) ?? parseIfIndoArabicNumber(raw);
          if (index && index !== 0) {
            this.goToRow.emit(index - 1);
            return;
          }
          if (!raw || raw.length < 1) {
            this.searchWorkerService.reset();
            return;
          }

          // Prefer content search whenever Arabic is present (handles diacritics / mixed paste)
          if (hasArabicLetters(raw)) {
            const normalized = normalizeArabic(raw);
            if (normalized.length >= 1) {
              this.searchWorkerService.search(normalized, this.collationKey);
            }
            return;
          }

          // Latin / English: search collation content (not only titles)
          if (isLatinTitleQuery(raw) && raw.length > 1) {
            this.searchWorkerService.search(raw, this.collationKey);
            return;
          }
        });

      this.sub2 = this.searchWorkerService.searchResults$.subscribe((data) => {
        if (data) {
          const { sentence, collationKey, results, indexedResults } = data;
          if (
            sentence === normalizeArabic(this.searchControl.value ?? '') &&
            collationKey === this.collationKey
          ) {
            // Lemma indexes use full `units[]` indices (same as the collation
            // rows), including divider slots — do not remap via content-only
            // indexes or highlights land on the wrong words/units.
            const hits = (results as number[][]) ?? [];
            this.searchService.currentResult.set(hits.length - 1);
            this.searchService.highlightedTokens.set(hits);
            this.searchService.indexedResults.set(
              (indexedResults ?? {}) as Record<
                number,
                Record<number, [number, number, number, number, number][]>
              >
            );

            if (hits.length > 0) {
              setTimeout(() => {
                this.searchService.currentResult.set(0);
                this.goToRow.emit(hits[0][0]);
              }, 10);
            }
          }
        } else {
          this.searchService.reset();
        }
      });
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
  async downloadEditionTable() {
    await this.downloadsService.downloadEditionTable();
  }


  toggleMobileSearchPanel(): void {
    const oldValue = this.showMobileSearchPanel();
    this.showMobileSearchPanel.set(!oldValue);
    if (oldValue) {
      this.searchControl.setValue('');
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
