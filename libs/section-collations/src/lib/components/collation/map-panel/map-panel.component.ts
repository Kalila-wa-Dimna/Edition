/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, AfterViewInit, ViewChild, OnDestroy, HostListener, Output, signal, Inject, OnInit } from '@angular/core';
import { CONFIG_TOKEN, IColors, IConfig, ThemeService } from '@kalila-edition/common-ui';
import { BehaviorSubject, Subject, Subscription, debounceTime, firstValueFrom } from 'rxjs';

const LETTERS = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'.split('');

const DARK_COLORS = {
  label: 'white',
  grid: 'gray',
  boxColor: '#edece8',
  altBoxColor: '#000000',
  boxBorderColor: '#004659',
  rowHighlighterFill: '#ccff00',
  boxHighlighterBorder: '#ccff00',
  highlighterText: 'black',
  boxWithSearchResult: '#f0b275',
}
const LIGHT_COLORS = {
  label: '#000000',
  grid: 'gray',
  boxColor: '#004659',
  altBoxColor: '#000000',
  boxBorderColor: 'white',
  rowHighlighterFill: '#ccff00',
  boxHighlighterBorder: '#ccff00',
  highlighterText: '#000000',
  boxWithSearchResult: '#f0b275',
}

interface IChangeableNode {
  setAttr(attr: string, val: string | number): unknown
}

@Component({
    selector: 'kd-map-panel',
    template: `
  @if (loading()) {
    <div class="loading">
      <mat-spinner></mat-spinner>
    </div>
  }
  <div class="title-preview">
    <ng-content></ng-content>
  </div>
  <div #container id="container"></div>
  `,
    styleUrls: ['./map-panel.component.scss'],
    standalone: false
})
export class MapPanelComponent implements AfterViewInit, OnDestroy, OnInit {
  canvas: unknown | null = null;
  @Output() rowHovered = new EventEmitter<number | null>();
  @Output() rowClicked = new EventEmitter<number>();


  renderSubject = new Subject<{ data: number[][], colors: IColors }>();
  renderSubscription = Subscription.EMPTY;
  private _collationName: string | null = null;
  rerenderStream = new BehaviorSubject<undefined>(undefined);

  themeSubscription = Subscription.EMPTY;
  rerenderSubscription = Subscription.EMPTY;

  rowHighlighter?: IChangeableNode;
  rowHighlighterNumber?: IChangeableNode;

  claculateRowHighlighterPosition = (index: number) => {
    // console.log('using dummy');
    return 100 * index
  }

  @HostListener('window:resize')
  onResize() {
    this.rerenderStream.next(undefined);
  }

  loading = signal(true);
  endpoint = (collationName: string) => `${this.config.dataEndPoint}collations/${collationName}/presence_matrix.json`

  @Input() set collationName(value: string) {
    this.loading.set(true);
    this._collationName = value;
    firstValueFrom(this.httpClient.get<number[][]>(this.endpoint(this._collationName))).then(async data => {
      const colors = await this.getThemeAndDetermineColors();
      this.renderSubject.next({ data, colors });
    });
  }

  private _cellsWithResults: Map<number, Set<number>> = new Map();

  @Input() set cellsWithResults(value: Map<number, Set<number>>) {
    this._cellsWithResults = value;
    if (this._collationName) {
      firstValueFrom(this.httpClient.get<number[][]>(this.endpoint(this._collationName))).then(async data => {
        const colors = await this.getThemeAndDetermineColors();
        this.renderSubject.next({ data, colors });
      });
    }

  }

  private _currentIndex = 0;

  @Input() set currentIndex(value: number) {
    this._currentIndex = value;
    if (this.rowHighlighter) {
      this.rowHighlighter.setAttr('x', this.claculateRowHighlighterPosition(value));

    }
    if (this.rowHighlighterNumber) {
      const display = value + 1;
      if (display % 5 === 0) {
        this.rowHighlighterNumber.setAttr('text', "");
      } else {
        this.rowHighlighterNumber.setAttr('text', display.toString());
      }
    }
  }

  @ViewChild('container')
  container!: ElementRef;



  constructor(private httpClient: HttpClient,
    private themeService: ThemeService,
    @Inject(CONFIG_TOKEN) private config: IConfig) { }

  async ngAfterViewInit() {

    if (this._collationName) {
      const data = await firstValueFrom(this.httpClient.get<number[][]>(this.endpoint(this._collationName)));

      this.rerenderSubscription = this.rerenderStream.subscribe(async () => {
        const colors = await this.getThemeAndDetermineColors();
        this.renderSubject.next({ data, colors });
      });

      this.themeSubscription = this.themeService.active$.subscribe(async theme => {
        const colors = this.determineColors(theme);
        this.renderSubject.next({ data, colors });
      });
    }


  }

  ngOnInit(): void {
    this.renderSubject.pipe(debounceTime(100)).subscribe(async ({ data, colors }) => {
      await this.buildMap(data, colors, this._currentIndex)
    })
  }

  async getThemeAndDetermineColors() {
    const theme = await firstValueFrom(this.themeService.active$);
    return this.determineColors(theme);
  }

  determineColors(theme: 'dark' | 'light' | 'system' = 'system') {
    if (theme === 'dark') {
      return DARK_COLORS;
    } else if (theme === 'light') {
      return LIGHT_COLORS;
    } else {
      const isDarkModePreferred =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDarkModePreferred ? DARK_COLORS : LIGHT_COLORS;
    }
  }

  async buildMap(data: number[][], colors = LIGHT_COLORS, currentIndex = 0) {
    const Konva = (await import('konva')).default;
    const containerWidth = this.container.nativeElement.offsetWidth;
    const containerHeight = this.container.nativeElement.offsetHeight;
    // const mode = 'bottom';

    const numberLineOffset = 15;
    const columnLabelOffset = 15;
    const labelFontSize = 10;
    const border = 1;
    // function definitions [TYPES ARE NOT IMPORTABLE, SO THE FUNCTIONS MUST STAY HERE]

    const numberOfColumns = data.length;
    const numberOfRows = data[0].length;
    const boxWidth = (containerHeight - numberLineOffset) / numberOfColumns;
    const boxHeight = (containerWidth - columnLabelOffset) / numberOfRows;

    function createGridLayer() {
      const layer = new Konva.Layer({ listening: false });

      const numberOfColumnLines = data.length;
      const columLineStep = boxWidth;


      for (let i = 0; i < numberOfColumnLines; i++) {
        const columnLineDistanceFromNumberLine = (columLineStep * i) + (boxWidth / 2);

        const columnLine = new Konva.Line({
          points: [columnLabelOffset - 5, numberLineOffset + columnLineDistanceFromNumberLine, containerWidth, numberLineOffset + columnLineDistanceFromNumberLine],
          stroke: colors.grid,
          strokeWidth: 1,

        });

        const columnHeading = new Konva.Text({
          x: 2,
          y: (numberLineOffset + columnLineDistanceFromNumberLine) - labelFontSize / 2,
          text: LETTERS[i],
          fontSize: labelFontSize,
          fontFamily: 'Calibri',
          fill: colors.label,
        });

        layer.add(columnLine);
        layer.add(columnHeading);
      }

      const rowLineStep = 5 * boxHeight;

      let count = 1;
      for (let i = 0; i <= numberOfRows; i++) {
        const display = i + 1;

        if (display % 5 === 0) {
          const rowLineDistanceFromNumberLine = (rowLineStep * count) - (boxHeight / 2);
          count++;
          const rowLine = new Konva.Line({
            points: [columnLabelOffset + rowLineDistanceFromNumberLine, numberLineOffset - 5, columnLabelOffset + rowLineDistanceFromNumberLine, containerHeight],
            stroke: colors.grid,
            strokeWidth: 1,
          });

          const rowNumber = new Konva.Text({
            x: columnLabelOffset + rowLineDistanceFromNumberLine - labelFontSize / 2,
            y: 2,
            text: display.toString(),
            fontSize: labelFontSize,
            fontFamily: 'Calibri',
            fill: colors.label,
          });

          layer.add(rowLine);
          layer.add(rowNumber);
        }


      }


      return layer;
    }

    const createBoxes = () => {
      const layer = new Konva.Layer({ listening: false });

      for (let row = 0; row < numberOfRows; row++) {
        const distanceFromLables = columnLabelOffset + (row * boxHeight);
        if (data[0][row] === -3) {
          const box = new Konva.Rect({
            x: distanceFromLables,
            y: numberLineOffset,
            width: boxHeight,
            height: containerHeight - numberLineOffset,
            fill: colors.boxColor,
            opacity: 0.9,
          });
          layer.add(box);
          continue;
        }

        for (let column = 0; column < numberOfColumns; column++) {
          if (data[column][row] !== -1) {
            const distanceFromNumbers = numberLineOffset + (column * boxWidth);
            const isSearchResult = this.hasSearchResult(row, column);
            const isOutOfOrder = data[column][row] !== row;
            const fill = isSearchResult ? colors.boxWithSearchResult : isOutOfOrder ? colors.altBoxColor : colors.boxColor;

            const box = new Konva.Rect({
              x: distanceFromLables,
              y: distanceFromNumbers,
              width: boxHeight,
              height: boxWidth,
              fill,
              fillEnabled: true,
              opacity: isSearchResult ? 0.6 : 0.5,
              stroke: colors.boxBorderColor,
              strokeWidth: border,
            });
            layer.add(box);
          }
        }
      }



      return layer;
    }


    const createHighlighters = () => {
      const layer = new Konva.Layer();

      this.claculateRowHighlighterPosition = (index: number) => columnLabelOffset + index * boxHeight;
      const currentX = this.claculateRowHighlighterPosition(currentIndex);
      const rowHighlighter = new Konva.Group({
        x: currentX,
        y: 0,
      });
      const rowHighlighterRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: boxHeight,
        height: containerHeight,
        opacity: 0.8,
        stroke: colors.rowHighlighterFill,
        strokeWidth: border,
      });

      rowHighlighter.add(rowHighlighterRect);






      layer.add(rowHighlighter);
      this.rowHighlighter = rowHighlighter;
      rowHighlighter.moveToTop();

      const columnHoverHighlighters: any[] = [];

      for (let column = 0; column < numberOfColumns; column++) {
        const distanceFromNumbers = numberLineOffset + (column * boxWidth);

        const columnHoverHighlighter = new Konva.Rect({
          x: 0,
          y: distanceFromNumbers,
          width: containerWidth,
          height: boxWidth,
          fill: colors.rowHighlighterFill,
          opacity: 0.0,
        });

        columnHoverHighlighters.push(columnHoverHighlighter);


        layer.add(columnHoverHighlighter);
      }


      for (let row = 0; row < numberOfRows; row++) {
        const distanceFromLables = columnLabelOffset + (row * boxHeight);

        const rowHoverHighlighter = new Konva.Rect({
          x: distanceFromLables,
          y: 0,
          width: boxHeight,
          height: containerHeight,
          fill: colors.rowHighlighterFill,
          opacity: 0.0,
        });

        layer.add(rowHoverHighlighter);

        for (let column = 0; column < numberOfColumns; column++) {
          if (data[column][row] !== -1) {
            const distanceFromNumbers = numberLineOffset + (column * boxWidth);
            const boxEventListener = new Konva.Rect({
              x: distanceFromLables,
              y: distanceFromNumbers,
              width: boxHeight,
              height: boxWidth,
              opacity: 0,

            });

            boxEventListener.on('mouseenter', () => {
              stage.container().style.cursor = 'pointer';
              rowHoverHighlighter.setAttr('opacity', 0.5);
              columnHoverHighlighters[column].setAttr('opacity', 0.5);
              this.rowHovered.emit(row);
            });

            boxEventListener.on('mouseleave', () => {
              stage.container().style.cursor = 'default';
              rowHoverHighlighter.setAttr('opacity', 0.0);
              columnHoverHighlighters[column].setAttr('opacity', 0.0);
              this.rowHovered.emit(null);
            });

            boxEventListener.on('click', () => {
              this.rowClicked.emit(row);
            });

            layer.add(boxEventListener);
          }
        }

      }




      return layer;
    }



    const stage = new Konva.Stage({
      container: this.container.nativeElement,
      width: containerWidth,
      height: containerHeight,
    });

    stage.add(createGridLayer());
    stage.add(createBoxes());
    stage.add(createHighlighters());

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
    this.themeSubscription.unsubscribe();
    this.rerenderSubscription.unsubscribe();
    this.renderSubscription.unsubscribe();
  }


}
