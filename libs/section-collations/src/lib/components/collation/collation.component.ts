import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import {
  ICollationColumn,
  ICollationUnit,
} from '../../models/collation-page-data.model';
import { CollationSettingsService } from '../../services/collation-settings.service';
import { CELL_PADDING } from '../../constants/size.constants';
import { ICollationInfo } from '../../models/collation-summary.model';
import { CollationDataService } from '../../services/collation-data.service';
import { IRowData } from '../../models/collation-row-data.model';
import { CollationVirtualScrollDirective } from '../../directives/virtual-scroll/collation-virtual-scroll.directive';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  withLatestFrom,
} from 'rxjs';
import { SearchService } from '../../services/search.service';
import { FacsimilePanelService } from '../../services/facsimile-panel.service';
import { SearchWorkerService } from '@kalila-edition/common-ui';

@Component({
  selector: 'kd-collation',
  templateUrl: './collation.component.html',
  styleUrls: ['./collation.component.scss'],
})
export class CollationComponent implements OnInit, AfterViewInit, OnDestroy {
  summary: ICollationInfo = { siglum: '', display: '', image: '' };
  columns: ICollationColumn[] = [];
  sigla: string[] = [];
  units: ICollationUnit[] = [];
  titles = signal<string[]>([]);
  rowData: IRowData[] = [];
  cellPadding = CELL_PADDING;
  dataSubscription?: Subscription;

  isMainFullWidth$ = this.settingsService.isMainFullWidth$;

  cellWidth$ = this.settingsService.cellWidth$;
  fontSize$ = this.settingsService.fontSize$;
  showFacsimilePreview$ = this.settingsService.showFacsimilePreview$;
  showMap$ = this.settingsService.showMap$;

  scrollSubject = new Subject<number>();
  scrollIndexSubscription = Subscription.EMPTY;
  currentScrollIndex = signal<number>(0);
  showTitelPreview = signal<number | null>(null);

  @ViewChild(CollationVirtualScrollDirective)
  viewport?: CollationVirtualScrollDirective;

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

  cellsWithResults = computed(() => {
    const cells = new Map<number, Set<number>>();
    const allTokens = this.searchService.highlightedTokens();
    if (allTokens) {
      for (const result of allTokens) {
        const row = result[0];
        const cell = result[1];
        if (!cells.has(row)) {
          cells.set(row, new Set<number>());
        }
        cells.get(row)?.add(cell);
      }
    }

    return cells;
  })

  constructor(
    private route: ActivatedRoute,
    private settingsService: CollationSettingsService,
    private dataService: CollationDataService,
    private searchService: SearchService,
    private facsimilePanelService: FacsimilePanelService,
    private searchWorkerService: SearchWorkerService,
  ) { }

  ngAfterViewInit(): void {
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
      this.scrollIndexSubscription = this.viewport._scrollStrategy.scrolledIndexChange.subscribe((index) => {
        this.currentScrollIndex.set(index);
      })
    }

  }


  async ngOnInit() {
    await this.settingsService.init();

    this.loadData(this.route.snapshot.data);

    this.dataSubscription = this.route.data.subscribe((data) => {
      this.loadData(data);
    });


  }

  private loadData(data: Data) {
    this.columns = data['pageData']['columns'];
    this.facsimilePanelService.columns = this.columns;
    this.sigla = this.columns.map((c) => c.siglum);
    this.units = data['pageData']['units'];
    this.titles.set(this.units.map((u) => u.title));
    this.summary = data['pageData']['summary'];
    this.rowData = data['pageData']['segmentData'];
    this.dataService.cache = data['pageData']['segmentData'];
    this.searchWorkerService.initCollation(this.summary.siglum);
  }

  onGoToRow(index: number) {
    this.scrollSubject.next(index);
  }

  getTitelPreview() {
    const index = this.showTitelPreview();
    if (index === null) {
      return '';
    }

    return `(${this.units[index].formattedOrder}) ${this.units[index].title}`;
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
