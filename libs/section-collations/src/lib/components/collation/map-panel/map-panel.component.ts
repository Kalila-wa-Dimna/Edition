import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  AfterViewInit,
  ViewChild,
  OnDestroy,
  HostListener,
  Output,
  signal,
  Inject,
  OnInit,
} from '@angular/core';
import { CONFIG_TOKEN, IConfig, ThemeService } from '@kalila-edition/common-ui';
import {
  BehaviorSubject,
  Subject,
  Subscription,
  debounceTime,
  firstValueFrom,
} from 'rxjs';
import {
  ICollationColumn,
  ICollationUnit,
} from '../../../models/collation-page-data.model';
import { IRowData } from '../../../models/collation-row-data.model';
import { CollationDataService } from '../../../services/collation-data.service';
import { UnitsService } from '../../../services/units.service';

const LETTERS = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'.split('');

type MapMode = 'density' | 'presence';
type MapScale = 'overview' | 'detail';

interface MapColors {
  label: string;
  grid: string;
  axisBg: string;
  present: string;
  outOfSequence: string;
  lacunaHint: string;
  divider: string;
  background: string;
  rowHighlighter: string;
  searchHit: string;
}

const LIGHT_COLORS: MapColors = {
  label: '#1a1a1a',
  grid: '#c5c5c5',
  axisBg: '#004659', // logo dark blue
  present: '#2c5f71',
  outOfSequence: '#c45f12',
  lacunaHint: '#b0a090',
  divider: '#004659',
  background: '#f7f7f5',
  rowHighlighter: '#c7e86a',
  searchHit: '#7a4fb0',
};

const DARK_COLORS: MapColors = {
  label: '#f2f2f2',
  grid: '#555555',
  axisBg: '#0d3a47',
  present: '#1f6b4a', // dark green
  outOfSequence: '#d4782e',
  lacunaHint: '#8a8074',
  divider: '#5a9aab',
  background: '#1c1c1c',
  rowHighlighter: '#c7e86a',
  searchHit: '#a878d4',
};

interface IChangeableNode {
  setAttr(attr: string, val: string | number): unknown;
}

@Component({
  selector: 'kd-map-panel',
  template: `
    <div class="map-toolbar">
      <div class="map-toolbar-left">
        <span class="map-title">Map — row = manuscript, column = unit.</span>
        <span class="legend">
          <span class="swatch present"></span> present
          <span class="swatch ooo"></span> out of sequence
          <span class="swatch search"></span> search
          <span class="swatch divider"></span> section
          <span class="swatch lacuna"></span> lacuna
        </span>
        <span class="hint">
          @if (scale() === 'overview') {
            Overview: all units fit in the panel width.
          } @else if (mode() === 'density') {
            Detail + Density: bar height = text size vs longest segment. Scroll horizontally.
          } @else {
            Detail + Presence: full bar = text present. Scroll horizontally. Click a cell to scroll above.
          }
        </span>
      </div>
      <div class="map-toolbar-right">
        <div class="mode-toggle" role="group" aria-label="Map scale">
          <button
            type="button"
            class="mode-btn"
            [class.active]="scale() === 'overview'"
            (click)="setScale('overview')"
          >
            Overview
          </button>
          <button
            type="button"
            class="mode-btn"
            [class.active]="scale() === 'detail'"
            (click)="setScale('detail')"
          >
            Detail
          </button>
        </div>
        <div class="mode-toggle" role="group" aria-label="Map mode">
          <button
            type="button"
            class="mode-btn"
            [class.active]="mode() === 'density'"
            (click)="setMode('density')"
          >
            Density
          </button>
          <button
            type="button"
            class="mode-btn"
            [class.active]="mode() === 'presence'"
            (click)="setMode('presence')"
          >
            Presence
          </button>
        </div>
      </div>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-spinner></mat-spinner>
      </div>
    }
    <div class="title-preview">
      <ng-content></ng-content>
    </div>
    <div
      class="map-canvas-scroll"
      (wheel)="onMapWheel($event)"
    >
      <div #container id="container"></div>
    </div>
  `,
  styleUrls: ['./map-panel.component.scss'],
  standalone: false,
})
export class MapPanelComponent implements AfterViewInit, OnDestroy, OnInit {
  @Output() rowHovered = new EventEmitter<number | null>();
  @Output() rowClicked = new EventEmitter<number>();

  private _columns: ICollationColumn[] = [];
  @Input() set columns(value: ICollationColumn[]) {
    this._columns = value ?? [];
    if (this.lastData) {
      this.getThemeAndDetermineColors().then((colors) => {
        this.renderSubject.next({ data: this.lastData!, colors });
      });
    }
  }
  get columns(): ICollationColumn[] {
    return this._columns;
  }

  units: ICollationUnit[] = [];
  mode = signal<MapMode>('density');
  /** overview = compress all units into the panel width; detail = readable cells + scroll */
  scale = signal<MapScale>('overview');
  loading = signal(true);

  renderSubject = new Subject<{ data: number[][]; colors: MapColors }>();
  private _collationName: string | null = null;
  private lastData: number[][] | null = null;
  rerenderStream = new BehaviorSubject<undefined>(undefined);

  themeSubscription = Subscription.EMPTY;
  rerenderSubscription = Subscription.EMPTY;
  renderSubscription = Subscription.EMPTY;

  rowHighlighter?: IChangeableNode;
  rowHighlighterNumber?: IChangeableNode;
  private rowBandHighlighter?: IChangeableNode;
  private scrollSyncCleanup: (() => void) | null = null;

  calculateRowHighlighterPosition = (index: number) => 100 * index;
  private calculateRowBandPosition = (_index: number) => 0;

  @HostListener('window:resize')
  onResize() {
    this.rerenderStream.next(undefined);
  }

  /** Keep horizontal map scroll from bouncing the page up/down. */
  onMapWheel(event: WheelEvent): void {
    const scroller = event.currentTarget as HTMLElement;
    const dx = event.deltaX;
    const dy = event.deltaY;
    // Trackpads often send mostly vertical delta while intending to pan the map
    if (Math.abs(dx) <= Math.abs(dy) && !event.shiftKey) {
      if (scroller.scrollWidth <= scroller.clientWidth + 1) {
        return;
      }
      scroller.scrollLeft += dy;
      event.preventDefault();
      return;
    }
    if (Math.abs(dy) > 0 && Math.abs(dx) > 0) {
      // Diagonal: only pan horizontally; block vertical page scroll
      event.preventDefault();
      scroller.scrollLeft += dx;
    }
  }

  endpoint = (collationName: string) =>
    `${this.config.dataEndPoint}collations/${collationName}/presence_matrix.json`;

  @Input() set collationKey(value: string) {
    if (!value) {
      return;
    }
    this.loading.set(true);
    this._collationName = value;
    firstValueFrom(
      this.httpClient.get<number[][]>(this.endpoint(this._collationName))
    )
      .then(async (data) => {
        this.lastData = data;
        const colors = await this.getThemeAndDetermineColors();
        this.renderSubject.next({ data, colors });
        // Re-render after layout settles (avoids 0-width first paint)
        requestAnimationFrame(() => this.rerenderStream.next(undefined));
      })
      .catch((err) => {
        console.error('Failed to load presence matrix', value, err);
        this.loading.set(false);
      });
  }

  private _cellsWithResults: Map<number, Set<number>> = new Map();

  @Input() set cellsWithResults(value: Map<number, Set<number>>) {
    this._cellsWithResults = value;
    if (this.lastData) {
      this.getThemeAndDetermineColors().then((colors) => {
        this.renderSubject.next({ data: this.lastData!, colors });
      });
    }
  }

  private _currentIndex = 0;

  @Input() set currentIndex(value: number) {
    this._currentIndex = value;
    if (this.rowHighlighter) {
      this.rowHighlighter.setAttr(
        'x',
        this.calculateRowHighlighterPosition(value)
      );
    }
    if (this.rowHighlighterNumber) {
      const display = value + 1;
      this.rowHighlighterNumber.setAttr(
        'text',
        display % 10 === 0 ? '' : display.toString()
      );
    }
  }

  @ViewChild('container')
  container!: ElementRef;

  constructor(
    private httpClient: HttpClient,
    private themeService: ThemeService,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private unitsService: UnitsService,
    private dataService: CollationDataService
  ) {}

  setMode(next: MapMode): void {
    if (this.mode() === next) {
      return;
    }
    this.mode.set(next);
    this.rerender();
  }

  setScale(next: MapScale): void {
    if (this.scale() === next) {
      return;
    }
    this.scale.set(next);
    this.rerender();
  }

  private rerender(): void {
    if (this.lastData) {
      this.getThemeAndDetermineColors().then((colors) => {
        this.renderSubject.next({ data: this.lastData!, colors });
      });
    }
  }

  async ngAfterViewInit() {
    if (this._collationName) {
      const data = await firstValueFrom(
        this.httpClient.get<number[][]>(this.endpoint(this._collationName))
      );
      this.lastData = data;

      this.rerenderSubscription = this.rerenderStream.subscribe(async () => {
        if (!this.lastData) {
          return;
        }
        const colors = await this.getThemeAndDetermineColors();
        this.renderSubject.next({ data: this.lastData, colors });
      });

      this.themeSubscription = this.themeService.active$.subscribe(
        async (theme) => {
          if (!this.lastData) {
            return;
          }
          const colors = this.determineColors(theme);
          this.renderSubject.next({ data: this.lastData, colors });
        }
      );
    }
  }

  ngOnInit(): void {
    this.unitsService.units$.subscribe((units) => {
      this.units = units;
      if (this.lastData) {
        this.getThemeAndDetermineColors().then((colors) => {
          this.renderSubject.next({ data: this.lastData!, colors });
        });
      }
    });
    this.renderSubscription = this.renderSubject
      .pipe(debounceTime(80))
      .subscribe(async ({ data, colors }) => {
        await this.buildMap(data, colors, this._currentIndex);
      });
  }

  async getThemeAndDetermineColors() {
    const theme = await firstValueFrom(this.themeService.active$);
    return this.determineColors(theme);
  }

  determineColors(theme: 'dark' | 'light' | 'system' = 'system'): MapColors {
    if (theme === 'dark') {
      return DARK_COLORS;
    }
    if (theme === 'light') {
      return LIGHT_COLORS;
    }
    const isDarkModePreferred =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDarkModePreferred ? DARK_COLORS : LIGHT_COLORS;
  }

  private msLabel(index: number, lettersOnly = false): string {
    const letter = LETTERS[index] ?? String(index + 1);
    if (lettersOnly) {
      return letter;
    }
    const siglum = this.columns[index]?.siglum ?? '';
    const short =
      siglum.length > 8 ? `${siglum.slice(0, 7)}…` : siglum || letter;
    return siglum ? `(${letter}) ${short}` : `(${letter})`;
  }

  /** Narrow screens: compact gutter, letters-only labels, sparser axis ticks. */
  private isMobileLayout(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }

  private isPresent(value: number): boolean {
    return value !== -1 && value !== -2 && value !== -3;
  }

  /** Divider / section marker column in presence_matrix (-2 / -3). */
  private isDividerValue(value: number): boolean {
    return value === -2 || value === -3;
  }

  /**
   * Out-of-sequence flags from each MS’s orderInMs (same source as cell ↑/↓ arrows).
   * presence_matrix alone misses reorders when some displaced units are stored as -1.
   */
  private computeOutOfSequenceFlags(
    numberOfManuscripts: number,
    numberOfUnits: number
  ): boolean[][] {
    const sigla = this.columns.map((c) => c.siglum);
    return Array.from({ length: numberOfManuscripts }, (_, m) => {
      const siglum = sigla[m];
      const flags = new Array(numberOfUnits).fill(false);
      if (!siglum) {
        return flags;
      }
      for (let u = 0; u < numberOfUnits; u++) {
        flags[u] = this.dataService.sequenceArrow(siglum, u) !== null;
      }
      return flags;
    });
  }

  private isDividerUnit(unitIndex: number, data: number[][]): boolean {
    if (this.units[unitIndex]?.isDivider) {
      return true;
    }
    // Fallback: matrix marks the whole column as divider
    return data.some((row) => this.isDividerValue(row[unitIndex]));
  }

  /** Token-count length for a cell; -1 if missing/lacuna. */
  private cellTokenLength(cell: IRowData[string] | undefined): number {
    if (!cell || cell.lacuna) {
      return -1;
    }
    if (!cell.tokens?.length) {
      return -1;
    }
    const n = cell.tokens.reduce((sum, line) => sum + line.length, 0);
    return n > 0 ? n : -1;
  }

  /**
   * [ms][unit] → 0–1 vs longest segment (by token count) in that unit.
   * -1 = no text. Built from the same cache as the collation grid.
   */
  private buildTextDensity(
    numberOfManuscripts: number,
    numberOfUnits: number
  ): number[][] {
    const sigla = this.columns.map((c) => c.siglum);
    const matrix: number[][] = Array.from({ length: numberOfManuscripts }, () =>
      new Array(numberOfUnits).fill(-1)
    );
    if (sigla.length !== numberOfManuscripts) {
      return matrix;
    }

    for (let u = 0; u < numberOfUnits; u++) {
      const row = this.dataService.cache[u];
      const lengths = sigla.map((siglum) => this.cellTokenLength(row?.[siglum]));
      const maxLen = Math.max(0, ...lengths);
      for (let m = 0; m < numberOfManuscripts; m++) {
        if (lengths[m] < 0 || maxLen <= 0) {
          matrix[m][u] = -1;
        } else {
          matrix[m][u] = lengths[m] / maxLen;
        }
      }
    }
    return matrix;
  }

  async buildMap(data: number[][], colors = LIGHT_COLORS, currentIndex = 0) {
    if (!this.container?.nativeElement) {
      return;
    }
    this.scrollSyncCleanup?.();
    this.scrollSyncCleanup = null;
    // Light mode: same dark present for Overview + Detail. Dark mode: dark green.
    const isDark = colors.background === '#1c1c1c';
    if (isDark) {
      colors = {
        ...colors,
        present: '#1f6b4a',
      };
    } else {
      colors = {
        ...colors,
        present: '#2c5f71',
      };
    }
    const Konva = (await import('konva')).default;
    const host = this.container.nativeElement as HTMLDivElement;
    host.innerHTML = '';

    const numberOfManuscripts = data.length;
    const numberOfUnits = data[0]?.length ?? 0;
    if (!numberOfManuscripts || !numberOfUnits) {
      this.loading.set(false);
      return;
    }

    const isMobile = this.isMobileLayout();
    const leftGutter = isMobile ? 26 : 78; // letters only on mobile
    const topGutter = isMobile ? 20 : 24;
    const rightPad = isMobile ? 2 : 4;
    const hostEl = host.closest('kd-map-panel') as HTMLElement | null;
    const scrollEl = host.parentElement as HTMLElement | null; // .map-canvas-scroll
    const panelEl = host.closest('.map-panel-container') as HTMLElement | null;
    const toolbarH =
      (hostEl?.querySelector('.map-toolbar') as HTMLElement | null)
        ?.offsetHeight || 40;
    const titleH =
      (hostEl?.querySelector('.title-preview') as HTMLElement | null)
        ?.offsetHeight || 28;
    // Overview: compress so every unit fits. Detail: fixed min cell width + horizontal scroll.
    const DETAIL_CELL_W = isMobile ? 8 : 10;
    const panelW =
      scrollEl?.clientWidth ||
      panelEl?.clientWidth ||
      hostEl?.clientWidth ||
      host.clientWidth ||
      800;
    const availableW = Math.max(80, panelW - leftGutter - rightPad);
    const fittedCellW = availableW / numberOfUnits;
    const cellW =
      this.scale() === 'overview'
        ? Math.max(0.5, fittedCellW)
        : Math.max(DETAIL_CELL_W, fittedCellW);
    const plotWidth = cellW * numberOfUnits;

    // Row height is fixed per manuscript — more MSS ⇒ taller map (not the same as 7 vs 14)
    const MIN_ROW_H = isMobile ? 14 : 16;
    const IDEAL_ROW_H = isMobile ? 16 : 20;
    const MAX_ROW_H = isMobile ? 18 : 24;
    const rowH = Math.min(MAX_ROW_H, Math.max(MIN_ROW_H, IDEAL_ROW_H));
    const plotHeight = rowH * numberOfManuscripts;

    const containerWidth = leftGutter + plotWidth + rightPad;
    const containerHeight = topGutter + plotHeight;

    // Grow/shrink the map panel with manuscript count; keep a minimum height
    const MIN_PANEL_H = 170;
    const MAX_PANEL_H = Math.round(window.innerHeight * 0.5);
    const neededPanelH = Math.min(
      MAX_PANEL_H,
      Math.max(MIN_PANEL_H, toolbarH + titleH + containerHeight + 10)
    );
    if (panelEl) {
      panelEl.style.height = `${neededPanelH}px`;
      panelEl.style.minHeight = `${MIN_PANEL_H}px`;
      panelEl.style.maxHeight = `${MAX_PANEL_H}px`;
    }
    const densityMode = this.mode() === 'density';
    const textDensity = densityMode
      ? this.buildTextDensity(numberOfManuscripts, numberOfUnits)
      : null;

    host.style.width = `${containerWidth}px`;
    host.style.height = `${containerHeight}px`;

    const stage = new Konva.Stage({
      container: host,
      width: containerWidth,
      height: containerHeight,
    });

    // Background (plot + axis only — sigla column drawn on sticky layer)
    const bgLayer = new Konva.Layer({ listening: false });
    bgLayer.add(
      new Konva.Rect({
        x: leftGutter,
        y: topGutter,
        width: plotWidth + rightPad,
        height: plotHeight,
        fill: colors.background,
      })
    );
    bgLayer.add(
      new Konva.Rect({
        x: leftGutter,
        y: 0,
        width: plotWidth + rightPad,
        height: topGutter,
        fill: colors.axisBg,
      })
    );
    stage.add(bgLayer);

    // Grid lines across the plot (sigla labels are sticky — separate layer)
    const gridLayer = new Konva.Layer({ listening: false });
    for (let m = 0; m < numberOfManuscripts; m++) {
      const y = topGutter + m * rowH;
      gridLayer.add(
        new Konva.Line({
          points: [leftGutter, y + rowH, leftGutter + plotWidth, y + rowH],
          stroke: colors.grid,
          strokeWidth: 0.6,
        })
      );
    }

    // Light decade guides (every 10 units) — plot only, not into the axis header
    for (let u = 9; u < numberOfUnits - 1; u += 10) {
      const x = leftGutter + (u + 1) * cellW;
      gridLayer.add(
        new Konva.Line({
          points: [x, topGutter, x, topGutter + plotHeight],
          stroke: colors.axisBg,
          strokeWidth: 0.7,
          opacity: 0.22,
        })
      );
    }

    // Unit numbers on the top axis — sparser + smaller on mobile to avoid overlap
    const lastDisplay = numberOfUnits;
    const axisFontSize = isMobile ? 9 : 11;
    const minLabelGapPx = isMobile ? 40 : 30;
    const stepUnits = Math.max(
      isMobile ? 20 : 10,
      Math.ceil(minLabelGapPx / Math.max(cellW, 0.5) / 10) * 10
    );
    let lastLabelRight = -Infinity;
    for (let u = 0; u < numberOfUnits; u++) {
      const display = u + 1;
      const isLast = u === numberOfUnits - 1;
      const isFirst = display === 1;
      const onStep = display % stepUnits === 0;
      if (!(isFirst || onStep || isLast)) {
        continue;
      }
      // Skip a step tick that would collide with the last number
      if (!isLast && lastDisplay - display < stepUnits * 0.5 && onStep) {
        continue;
      }
      const label = String(display);
      const labelW = Math.max(12, label.length * (axisFontSize * 0.65));
      let textX: number;
      let align: 'left' | 'center' | 'right' = 'center';
      if (isLast) {
        textX = leftGutter + plotWidth - labelW - 2;
        align = 'right';
      } else if (isFirst) {
        textX = leftGutter + 2;
        align = 'left';
      } else {
        textX = leftGutter + u * cellW + cellW * 0.5 - labelW / 2;
      }
      textX = Math.max(
        leftGutter,
        Math.min(textX, leftGutter + plotWidth - labelW)
      );
      if (!isFirst && !isLast && textX < lastLabelRight + 6) {
        continue;
      }
      lastLabelRight = textX + labelW;
      gridLayer.add(
        new Konva.Text({
          x: textX,
          y: isMobile ? 4 : 5,
          width: labelW + 4,
          align,
          text: label,
          fontSize: axisFontSize,
          fontFamily: 'Source Sans 3, Calibri, sans-serif',
          fontStyle: isLast ? '700' : 'normal',
          fill: '#ffffff',
        })
      );
    }
    stage.add(gridLayer);

    // Shared column content width — same for bars and dividers (classic look)
    const colGap = Math.max(1.5, Math.min(2.5, cellW * 0.14));
    const colW = Math.min(cellW * 0.85, Math.max(cellW * 0.55, cellW - colGap));

    // Bars — Presence = full cell; Density = text size vs longest in unit
    const dataLayer = new Konva.Layer({ listening: false });
    const oooFlags = this.computeOutOfSequenceFlags(
      numberOfManuscripts,
      numberOfUnits
    );
    for (let m = 0; m < numberOfManuscripts; m++) {
      const rowTop = topGutter + m * rowH;
      for (let u = 0; u < numberOfUnits; u++) {
        if (this.isDividerUnit(u, data)) {
          continue; // drawn as a full column band below
        }
        const value = data[m][u];
        if (!this.isPresent(value)) {
          continue;
        }
        const isSearch = this.hasSearchResult(u, m);
        const ooo = oooFlags[m][u];
        const fill = isSearch
          ? colors.searchHit
          : ooo
            ? colors.outOfSequence
            : colors.present;

        // Same bar width everywhere (including next to section dividers)
        const barWidth = colW;
        const x = leftGutter + u * cellW + (cellW - barWidth) / 2;

        let barHeight: number;
        if (densityMode && textDensity) {
          const ratio = textDensity[m][u];
          // Present in matrix but no tokens yet → treat as mid-length
          const r =
            ratio == null || ratio < 0
              ? 0.5
              : Math.min(1, Math.max(0, ratio));
          // Linear: longest = full row, shortest still clearly visible
          const sizeRatio = 0.22 + 0.78 * r;
          const usableH = rowH - 2;
          barHeight = Math.max(4, usableH * sizeRatio);
        } else {
          // Presence: fill the row
          barHeight = Math.max(4, rowH - 2);
        }
        const y = rowTop + rowH - 1 - barHeight;

        dataLayer.add(
          new Konva.Rect({
            x,
            y,
            width: barWidth,
            height: barHeight,
            fill,
            opacity: 1,
          })
        );
      }
    }
    stage.add(dataLayer);

    // Section dividers — plot height only (do not climb into the axis header)
    const dividerLayer = new Konva.Layer({ listening: false });

    dividerLayer.add(
      new Konva.Rect({
        x: leftGutter,
        y: topGutter,
        width: plotWidth,
        height: plotHeight,
        stroke: colors.axisBg,
        strokeWidth: 1,
        listening: false,
      })
    );

    for (let u = 0; u < numberOfUnits; u++) {
      if (!this.isDividerUnit(u, data)) {
        continue;
      }
      const x = leftGutter + u * cellW + (cellW - colW) / 2;
      dividerLayer.add(
        new Konva.Rect({
          x,
          y: topGutter,
          width: colW,
          height: plotHeight,
          fill: colors.divider,
          opacity: 0.92,
          listening: false,
        })
      );
    }
    stage.add(dividerLayer);

    // Interaction: vertical + horizontal ruler (crosshair)
    const interact = new Konva.Layer();
    this.calculateRowHighlighterPosition = (index: number) =>
      leftGutter + index * cellW;
    this.calculateRowBandPosition = (msIndex: number) =>
      topGutter + msIndex * rowH;

    const colHighlighter = new Konva.Rect({
      x: this.calculateRowHighlighterPosition(currentIndex),
      y: topGutter,
      width: Math.max(cellW, 2),
      height: plotHeight,
      fill: colors.rowHighlighter,
      opacity: 0.35,
      listening: false,
    });
    const rowBand = new Konva.Rect({
      x: leftGutter,
      y: topGutter,
      width: plotWidth,
      height: rowH,
      fill: colors.rowHighlighter,
      opacity: 0.35,
      listening: false,
      visible: false,
    });
    interact.add(colHighlighter);
    interact.add(rowBand);
    this.rowHighlighter = colHighlighter;
    this.rowBandHighlighter = rowBand;

    const updateRowBand = (pointerY: number | undefined) => {
      if (pointerY == null) {
        rowBand.visible(false);
        return;
      }
      const ms = Math.max(
        0,
        Math.min(
          numberOfManuscripts - 1,
          Math.floor((pointerY - topGutter) / rowH)
        )
      );
      rowBand.y(this.calculateRowBandPosition(ms));
      rowBand.visible(true);
    };

    for (let u = 0; u < numberOfUnits; u++) {
      const x = leftGutter + u * cellW;
      const hit = new Konva.Rect({
        x,
        y: topGutter,
        width: cellW,
        height: plotHeight,
        opacity: 0,
      });
      hit.on('mousemove', () => {
        stage.container().style.cursor = 'pointer';
        colHighlighter.setAttr('x', x);
        updateRowBand(stage.getPointerPosition()?.y);
        this.rowHovered.emit(u);
      });
      hit.on('mouseenter', () => {
        stage.container().style.cursor = 'pointer';
        colHighlighter.setAttr('x', x);
        updateRowBand(stage.getPointerPosition()?.y);
        this.rowHovered.emit(u);
      });
      hit.on('mouseleave', () => {
        stage.container().style.cursor = 'default';
        colHighlighter.setAttr(
          'x',
          this.calculateRowHighlighterPosition(this._currentIndex)
        );
        rowBand.visible(false);
        this.rowHovered.emit(null);
      });
      hit.on('click', () => this.rowClicked.emit(u));
      interact.add(hit);
    }
    stage.add(interact);

    // Sticky manuscript names — stay fixed on the left while the plot scrolls
    const stickyLayer = new Konva.Layer({ listening: false });
    const labelColFill =
      colors.background === '#1c1c1c' ? '#0a303a' : '#e5ecee';
    stickyLayer.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: leftGutter,
        height: topGutter,
        fill: colors.axisBg,
        listening: false,
      })
    );
    stickyLayer.add(
      new Konva.Rect({
        x: 0,
        y: topGutter,
        width: leftGutter,
        height: plotHeight,
        fill: labelColFill,
        listening: false,
      })
    );
    stickyLayer.add(
      new Konva.Line({
        points: [leftGutter, 0, leftGutter, topGutter + plotHeight],
        stroke: colors.axisBg,
        strokeWidth: 1.5,
        listening: false,
      })
    );
    for (let m = 0; m < numberOfManuscripts; m++) {
      const y = topGutter + m * rowH;
      stickyLayer.add(
        new Konva.Line({
          points: [0, y + rowH, leftGutter, y + rowH],
          stroke: colors.grid,
          strokeWidth: 0.6,
        })
      );
      const labelFont = isMobile ? 11 : 10;
      stickyLayer.add(
        new Konva.Text({
          x: isMobile ? 2 : 4,
          y: y + rowH / 2 - labelFont / 2,
          width: leftGutter - (isMobile ? 4 : 8),
          align: isMobile ? 'center' : 'left',
          text: this.msLabel(m, isMobile),
          fontSize: labelFont,
          fontStyle: isMobile ? '700' : 'normal',
          fontFamily: 'Source Sans 3, Calibri, sans-serif',
          fill: colors.label,
          ellipsis: true,
          wrap: 'none',
        })
      );
    }
    stage.add(stickyLayer);

    const syncStickyLabels = () => {
      stickyLayer.x(scrollEl?.scrollLeft ?? 0);
      stickyLayer.batchDraw();
    };
    scrollEl?.addEventListener('scroll', syncStickyLabels);
    this.scrollSyncCleanup = () => {
      scrollEl?.removeEventListener('scroll', syncStickyLabels);
    };
    syncStickyLabels();

    this.loading.set(false);
  }

  hasSearchResult(row: number, column: number) {
    if (this._cellsWithResults.has(row)) {
      const cells = this._cellsWithResults.get(row);
      if (cells) {
        return cells.has(column);
      }
    }
    return false;
  }

  ngOnDestroy() {
    this.scrollSyncCleanup?.();
    this.themeSubscription.unsubscribe();
    this.rerenderSubscription.unsubscribe();
    this.renderSubscription.unsubscribe();
  }
}
