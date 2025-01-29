import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  ViewChild,
  computed,
} from '@angular/core';
import { IRowData } from '../../../models/collation-row-data.model';
import {
  ICollationColumn,
  ICollationUnit,
} from '../../../models/collation-page-data.model';
import { SearchService } from '../../../services/search.service';
import { CollationSettingsService } from '../../../services/collation-settings.service';
import { CELL_PADDING } from '../../../constants/size.constants';
import { CollationVirtualScrollDirective } from '../../../directives/virtual-scroll/collation-virtual-scroll.directive';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  withLatestFrom,
} from 'rxjs';

@Component({
  selector: 'kd-collation-container',
  template: `
    <kd-collation-heading [columns]="columns"></kd-collation-heading>
    <cdk-virtual-scroll-viewport
      kdCollationVirtualScroll
      [units]="units"
      #collationBody
      class="collation-body"
      [ngStyle]="{
        'width.px':
          columns.length * ((cellWidth$ | async) ?? 75) +
          2 * columns.length * cellPadding,
        'font-size.px': fontSize$ | async
      }"
    >
      <kd-collation-row
        *cdkVirtualFor="let item of rowData; index as rowIndex"
        [unit]="units[rowIndex]"
        [sigla]="sigla"
        [rowData]="item"
        [searchResult]="highlightedRows()?.includes(rowIndex) || false"
        [chapterSiglum]="chapterSiglum"
        [currentResult]="activeHighlightedRow() === rowIndex"
        [ngStyle]="{
        'width.px': columns.length * ((cellWidth$ | async) ?? 75) + 2 * columns.length * cellPadding,
      }"
      >
      </kd-collation-row>
    </cdk-virtual-scroll-viewport>
  `,
  styles: `


  `,
  standalone: false,
})
export class CollationContainerComponent implements AfterViewInit, OnDestroy {
  private _rowData: IRowData[] = [];

  @Input()
  set rowData(value: IRowData[]) {
    this._rowData = value;
  }

  get rowData(): IRowData[] {
    return this._rowData;
  }

  @Input() columns: ICollationColumn[] = [];

  @Input() units: ICollationUnit[] = [];

  @Input() sigla: string[] = [];
  @Input() chapterSiglum = '';

  cellWidth$ = this.settingsService.cellWidth$;
  fontSize$ = this.settingsService.fontSize$;
  cellPadding = CELL_PADDING;

  highlightedRows = this.searchService.highlightedRows;
  activeHighlightedRow = computed(() => {
    const currentresult = this.searchService.currentResult();
    const rows = this.searchService.highlightedRows();
    if (rows) {
      return rows[currentresult];
    }
    const cells = this.searchService.highlightedTokens();
    if (cells && cells[currentresult]) {
      return cells[currentresult][0];
    }
    return null;
  });

  scrollSubject = new Subject<number>();
  scrollIndexSubscription = Subscription.EMPTY;

  @ViewChild(CollationVirtualScrollDirective)
  viewport?: CollationVirtualScrollDirective;

  constructor(
    private searchService: SearchService,
    private settingsService: CollationSettingsService
  ) {}

  ngAfterViewInit(): void {
    this.settingsService.currentScrollIndex.next(0);
    if (this.viewport) {
      this.scrollSubject
        .pipe(
          debounceTime(50),
          withLatestFrom(
            this.viewport._scrollStrategy.scrolledIndexChangeSubject$
          ),
          distinctUntilChanged(
            ([goal, curr], [oldGoal, oldCurr]) =>
              goal === oldGoal && curr === oldCurr
          )
        )
        .subscribe(([goal, curr]) => {
          this.viewport?._scrollStrategy.scrollToIndex(goal, 'auto');
          if (Math.abs(goal - curr) > 1) {
            this.scrollSubject.next(goal);
          }
        });
      this.scrollIndexSubscription =
        this.viewport._scrollStrategy.scrolledIndexChange.subscribe((index) => {
          this.settingsService.currentScrollIndex.next(index);
        });
    }
  }

  ngOnDestroy(): void {
    this.scrollIndexSubscription.unsubscribe();
  }
}
