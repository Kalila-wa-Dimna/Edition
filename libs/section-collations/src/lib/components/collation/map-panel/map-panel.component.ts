/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, AfterViewInit, ViewChild, OnDestroy, HostListener, Output, signal } from '@angular/core';
import { ThemeService } from '@kalila-edition/common-ui';
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';

const DATA_ENDPOINT = "/assets/data/collations"
const LETTERS = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'.split('');

const DARK_COLORS = {
  label: 'white',
  grid: 'gray',
  boxColor: '#edece8',
  altBoxColor: 'red',
  boxBorderColor: '#004659',
  rowHighlighterFill: '#ffdfbf',
  boxHighlighterBorder: '#f0b275',
  highlighterText: 'black',
  boxWithSearchResult: 'yellow',
}
const LIGHT_COLORS = {
  label: 'black',
  grid: 'gray',
  boxColor: '#004659',
  altBoxColor: 'black',
  boxBorderColor: 'white',
  rowHighlighterFill: '#ffdfbf',
  boxHighlighterBorder: '#f0b275',
  highlighterText: 'black',
  boxWithSearchResult: 'yellow',
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
  styleUrls: ['./map-panel.component.scss']
})
export class MapPanelComponent implements AfterViewInit, OnDestroy {
  canvas: unknown | null = null;
  @Output() rowHovered = new EventEmitter<number | null>();
  @Output() rowClicked = new EventEmitter<number>();


  private _collationName: string | null = null;
  rerenderStream = new BehaviorSubject<undefined>(undefined);

  themeSubscription = Subscription.EMPTY;
  rerenderSubscription = Subscription.EMPTY;

  rowHighlighter?: IChangeableNode;

  claculateRowHighlighterPosition = (index: number) => 100 * index

  @HostListener('window:resize')
  onResize() {
    this.rerenderStream.next(undefined);
  }

  loading = signal(true);

  @Input() set collationName(value: string) {
    this.loading.set(true);
    this._collationName = value;
    firstValueFrom(this.httpClient.get<number[][]>(`${DATA_ENDPOINT}/${this._collationName}/presence_matrix.json`)).then(async data => {
      const colors = await this.getThemeAndDetermineColors();
      await this.buildMap(data, colors);
    });
  }

  private _cellsWithResults: Map<number, Set<number>> = new Map();

  @Input() set cellsWithResults(value: Map<number, Set<number>>) {
    this._cellsWithResults = value;
    firstValueFrom(this.httpClient.get<number[][]>(`${DATA_ENDPOINT}/${this._collationName}/presence_matrix.json`)).then(async data => {
      const colors = await this.getThemeAndDetermineColors();
      await this.buildMap(data, colors);
    });
  }

  @Input() set currentIndex(value: number) {
    if (this.rowHighlighter) {
      this.rowHighlighter.setAttr('x', this.claculateRowHighlighterPosition(value));
    }
  }

  @ViewChild('container')
  container!: ElementRef;



  constructor(private httpClient: HttpClient, private themeService: ThemeService) { }

  async ngAfterViewInit() {
    const data = await firstValueFrom(this.httpClient.get<number[][]>(`${DATA_ENDPOINT}/${this._collationName}/presence_matrix.json`));

    this.rerenderSubscription = this.rerenderStream.subscribe(async () => {
      const colors = await this.getThemeAndDetermineColors();
      await this.buildMap(data, colors);
    });

    this.themeSubscription = this.themeService.active$.subscribe(async theme => {
      const colors = this.determineColors(theme);
      await this.buildMap(data, colors);
    });
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

  async buildMap(data: number[][], colors = LIGHT_COLORS) {
    const Konva = (await import('konva')).default;
    const containerWidth = this.container.nativeElement.offsetWidth;
    const containerHeight = this.container.nativeElement.offsetHeight;
    const heightOffset = 10;
    const widthOffset = 15;
    const labelFontSize = 10;
    const labelPositioningCorrection = labelFontSize / 2
    const stage = new Konva.Stage({
      container: this.container.nativeElement,
      width: containerWidth,
      height: containerHeight,
    });

    // OUTER LABELS
    const lineSpacing = (containerHeight - heightOffset) / (data.length);
    const baseLabelsLayer = new Konva.Layer({ listening: false });

    const distance = heightOffset + lineSpacing / 2;
    data.forEach((_, index) => {
      const yPos = distance + index * lineSpacing;


      const text = new Konva.Text({
        x: 2,
        y: yPos - labelPositioningCorrection,
        text: LETTERS[index],
        fontSize: labelFontSize,
        fontFamily: 'Calibri',
        fill: colors.label,
      });
      baseLabelsLayer.add(text);
      const line = new Konva.Line({
        points: [0, yPos, containerWidth, yPos],
        stroke: colors.grid,
        strokeWidth: 1,
      });
      baseLabelsLayer.add(line);
    });

    const maxNumber = data[0].length;
    const multiplesOfFive = Math.floor(maxNumber / 5);
    const widthPerFive = (containerWidth - widthOffset) / multiplesOfFive;

    for (let i = 1; i < multiplesOfFive; i++) {
      const xPos = widthOffset + i * widthPerFive;
      const numberText = new Konva.Text({
        x: xPos - labelPositioningCorrection,
        y: 0,
        text: (i * 5).toString(),
        fontSize: labelFontSize,
        fontFamily: 'Calibri',
        fill: colors.label,
      });
      const line = new Konva.Line({
        points: [xPos, 0, xPos, containerHeight],
        stroke: colors.grid,
        strokeWidth: 1,
      });
      baseLabelsLayer.add(line);
      baseLabelsLayer.add(numberText);
    }



    // Unit boxes, row highlighter, event layer
    const boxHeight = lineSpacing;
    const boxWidth = (containerWidth - widthOffset) / data[0].length;
    const border = 2;
    const unitBoxesLayer = new Konva.Layer({ listening: false });
    const rowHighlighter = new Konva.Group({
      x: widthOffset + boxWidth / 2,
      y: 0,
    });
    const rowHighlighterRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: boxWidth,
      height: containerHeight,
      fill: colors.rowHighlighterFill,
      opacity: 0.9,
      stroke: colors.boxHighlighterBorder,
      strokeWidth: border,
    });
    rowHighlighter.add(rowHighlighterRect);
    this.claculateRowHighlighterPosition = (index: number) => widthOffset + boxWidth / 2 + index * boxWidth;
    data.forEach((_, index) => {
      const yPos = distance + index * lineSpacing;


      const text = new Konva.Text({
        x: boxWidth / 2 - labelPositioningCorrection,
        y: yPos - labelPositioningCorrection,
        text: LETTERS[index],
        fontSize: labelFontSize,
        fontFamily: 'Calibri',
        fill: colors.highlighterText,
      });
      rowHighlighter.add(text);
    });
    baseLabelsLayer.add(rowHighlighter);
    const eventsLayer = new Konva.Layer();
    for (let column = 0; column < data[0].length; column++) {
      const xPos = widthOffset + column * boxWidth - boxWidth / 2;
      if (data[0][column] === -2) { // divider
        const box = new Konva.Rect({
          x: xPos,
          y: heightOffset,
          width: boxWidth,
          height: containerHeight - heightOffset,
          fill: colors.boxColor,
          opacity: 1,
        });
        unitBoxesLayer.add(box);
      }
      for (let row = 0; row < data.length; row++) {
        if (data[row][column] !== -1) {
          const isSearchResult = this.hasSearchResult(column, row);
          const isOutOfOrder = data[row][column] !== column;
          const fill = isSearchResult ? colors.boxWithSearchResult : isOutOfOrder ? colors.altBoxColor : colors.boxColor;
          const box = new Konva.Rect({
            x: xPos,
            y: distance + row * boxHeight - boxHeight / 2,
            width: boxWidth,
            height: boxHeight,
            fill,
            opacity: 0.5,
            stroke: colors.boxBorderColor,
            strokeWidth: border,
          });
          unitBoxesLayer.add(box);
        }
      }
      const rowEventListner = new Konva.Rect({
        x: xPos,
        y: 0,
        width: boxWidth,
        height: containerHeight,
        fill: colors.rowHighlighterFill,
        opacity: 0.0,
      });

      rowEventListner.on('mouseenter', () => {
        stage.container().style.cursor = 'pointer';
        rowEventListner.setAttr('opacity', 0.5);
        this.rowHovered.emit(column);
      });

      rowEventListner.on('mouseleave', () => {
        stage.container().style.cursor = 'default';
        rowEventListner.setAttr('opacity', 0.0);
        this.rowHovered.emit(null);
      });

      rowEventListner.on('click', () => {
        this.rowClicked.emit(column);
      });

      eventsLayer.add(rowEventListner);
    }
    stage.add(baseLabelsLayer);
    stage.add(unitBoxesLayer);
    stage.add(eventsLayer);

    this.canvas = stage;
    this.rowHighlighter = rowHighlighter;
    rowHighlighter.moveToTop();
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
  }


}
