import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ICollationColumn,
  ICollationUnit,
} from '../../models/collation-page-data.model';
import { CollationSettingsService } from '../../services/collation-settings.service';
import { CELL_PADDING } from '../../constants/cell-width.constants';
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
  rowData: IRowData[] = [];
  cellPadding = CELL_PADDING;
  sub?: Subscription;

  isMainFullWidth$ = this.settingsService.isMainFullWidth$;

  cellWidth$ = this.settingsService.cellWidth$;
  fontSize$ = this.settingsService.fontSize$;

  scrollSubject = new Subject<number>();

  @ViewChild(CollationVirtualScrollDirective)
  viewport?: CollationVirtualScrollDirective;

  constructor(
    private route: ActivatedRoute,
    private settingsService: CollationSettingsService,
    private dataService: CollationDataService
  ) {}

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
    }
  }

  async ngOnInit() {
    this.columns = this.route.snapshot.data['pageData']['columns'];
    this.sigla = this.columns.map((c) => c.siglum);
    this.units = this.route.snapshot.data['pageData']['units'];
    this.summary = this.route.snapshot.data['pageData']['summary'];
    this.rowData = this.route.snapshot.data['pageData']['segmentData'];
    this.dataService.cache =
      this.route.snapshot.data['pageData']['segmentData'];

    this.sub = this.route.data.subscribe((data) => {
      this.columns = data['pageData']['columns'];
      this.sigla = this.columns.map((c) => c.siglum);
      this.units = data['pageData']['units'];
      this.summary = data['pageData']['summary'];
      this.rowData = data['pageData']['segmentData'];
      this.dataService.cache = data['pageData']['segmentData'];
    });
  }

  onGoToRow(index: number) {
    this.scrollSubject.next(index);
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
