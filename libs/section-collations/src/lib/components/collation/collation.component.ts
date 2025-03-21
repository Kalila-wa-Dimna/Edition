import {
  AfterViewInit,
  Component,
  Inject,
  LOCALE_ID,
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
import {
  IRange,
  IRangeDefinition,
  IRowData,
} from '../../models/collation-row-data.model';
import { BehaviorSubject, Subscription, combineLatest, map } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { FacsimilePanelService } from '../../services/facsimile-panel.service';
import { SearchWorkerService } from '@kalila-edition/common-ui';
import { CollationContainerComponent } from './collation-container/collation-container.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { DownloadsService } from '../../services/downloads.service';
import { UnitsService } from '../../services/units.service';
@Component({
  selector: 'kd-collation',
  templateUrl: './collation.component.html',
  styleUrls: ['./collation.component.scss'],
  standalone: false,
})
export class CollationComponent implements OnInit, AfterViewInit, OnDestroy {
  summary: ICollationInfo = { siglum: '', display: '', image: '', key: '' };
  columns: ICollationColumn[] = [];
  sigla: string[] = [];
  units: ICollationUnit[] = [];
  versionSummary: Record<string, number> = {};

  get version() {
    const values = Object.values(this.versionSummary);

    if (values.length !== 0) {
      return Math.max(...values);
    }

    return;
  }

  get versionDetails() {
    const entries = Object.entries(this.versionSummary);

    if (entries.length !== 0) {
      return entries
        .map(([siglum, version]) => {
          const formattedVersion = new Date(version).toLocaleString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          return `${siglum}_${formattedVersion}`;
        })
        .join('\n');
    }

    return '';
  }

  numberOfColumns$ = new BehaviorSubject<number>(0);

  titles = signal<string[]>([]);
  visibleColumns = toSignal(this.settingsService.visibleColumns$);
  rowDataReciever = signal<IRowData[]>([]);
  rowData = computed(() => {
    const original = this.rowDataReciever();
    const searchResults = this.searchService.indexedResults();
    const currentResult = this.searchService.currentResult();
    if (!searchResults) {
      return original;
    }

    const rowsWithResults: IRowData[] = [];

    original.forEach((row, index) => {
      const unitHits = searchResults[index];
      if (!unitHits) {
        rowsWithResults.push(row);
        return;
      }

      const newRow: IRowData = {};
      this.sigla.forEach((siglum, columnIndex) => {
        const originalCell = row[siglum];
        const cellHits = unitHits[columnIndex];
        if (!cellHits || !originalCell) {
          newRow[siglum] = originalCell;

          return;
        }
        const defs: IRangeDefinition[] = cellHits.map((hit) => ({
          start: [hit[1], hit[2]],
          end: [hit[3], hit[4]],
          color: hit[0] === currentResult ? '#f0b275' : '#ffdfbf',
        }));

        newRow[siglum] = {
          ...originalCell,
          ranges: buildRages(defs, originalCell.tokens),
        };
      });

      rowsWithResults.push(newRow);
    });

    return rowsWithResults;
  });
  cellPadding = CELL_PADDING;
  dataSubscription = Subscription.EMPTY;

  isMainFullWidth$ = this.settingsService.isMainFullWidth$;

  showFacsimilePreview$ = this.settingsService.showFacsimilePreview$;
  showMap$ = this.settingsService.showMap$;
  mainContainerWidth$ = combineLatest([
    this.numberOfColumns$,
    this.settingsService.cellWidth$,
  ]).pipe(
    map(
      ([numberOfColumns, cellWidth]) =>
        `${
          numberOfColumns * (cellWidth + 2 * CELL_PADDING) + 4 * CELL_PADDING
        }px`
    )
  );

  showTitlePreview = signal<number | null>(null);

  @ViewChild(CollationContainerComponent)
  collationContainer?: CollationContainerComponent;

  currentScrollIndex = signal<number>(0);
  currentScrollIndexSubscription = Subscription.EMPTY;

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
  });

  constructor(
    private route: ActivatedRoute,
    private settingsService: CollationSettingsService,
    private dataService: CollationDataService,
    private searchService: SearchService,
    private facsimilePanelService: FacsimilePanelService,
    private searchWorkerService: SearchWorkerService,
    private downloadsService: DownloadsService,
    private unitsService: UnitsService,
    @Inject(LOCALE_ID) public locale: string
  ) {}

  ngAfterViewInit(): void {
    this.currentScrollIndexSubscription =
      this.settingsService.currentScrollIndex.subscribe((index) => {
        this.currentScrollIndex.set(index);
      });
  }

  async ngOnInit() {
    await this.settingsService.init();

    this.loadData(this.route.snapshot.data);

    this.dataSubscription = this.route.data.subscribe((data) => {
      this.loadData(data);
    });
  }

  private loadData(data: Data) {
    this.versionSummary = data['pageData']['versionSummary'];
    this.columns = data['pageData']['columns'];
    this.numberOfColumns$.next(this.columns.length);
    this.facsimilePanelService.columns = this.columns;
    this.sigla = this.columns.map((c) => c.siglum);
    this.units = data['pageData']['units'];
    this.unitsService.setUnits(this.units);
    this.titles.set(this.units.map((u) => u.title));
    this.summary = data['pageData']['summary'];
    this.rowDataReciever.set(data['pageData']['segmentData']);
    this.dataService.cache = data['pageData']['segmentData'];
    this.searchService.reset();
    this.searchWorkerService.initCollation(this.summary.key);
    this.downloadsService.init(this.summary.key);
  }

  onGoToRow(index: number) {
    this.collationContainer?.scrollSubject.next(index);
  }

  getTitelPreview() {
    const index = this.showTitlePreview();
    if (index === null) {
      return '';
    }

    return `(${this.units[index].formattedOrder}) ${this.units[index].title}`;
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
    this.currentScrollIndexSubscription.unsubscribe();
  }
}

function buildRages(rangeDefinitions: IRangeDefinition[], tokens: string[][]) {
  const ranges: IRange[] = [];

  const getRangeContiningWord = (lineIndex: number, wordIndex: number) => {
    for (let i = 0; i < rangeDefinitions.length; i++) {
      const range = rangeDefinitions[i];
      if (range.start[0] <= lineIndex && range.end[0] >= lineIndex) {
        if (range.start[0] === lineIndex && range.start[1] > wordIndex) {
          continue;
        }
        if (range.end[0] === lineIndex && range.end[1] < wordIndex) {
          continue;
        }
        return range;
      }
    }
    return null;
  };

  tokens.forEach((line, lineIndex) => {
    line.forEach((word, wordIndex) => {
      const rageContiningWord = getRangeContiningWord(lineIndex, wordIndex);
      if (rageContiningWord) {
        ranges.push({
          text: word,
          color: rageContiningWord.color,
        });
      } else {
        ranges.push({
          text: word,
        });
      }
    });
  });
  return ranges;
}
