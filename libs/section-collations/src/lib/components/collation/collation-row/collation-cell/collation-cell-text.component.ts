import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { IRange } from './models';
import { SegmentColorService } from '../../../../services/segment-color.service';

interface TokenSegment {
  token: string;
  groupIndex: number;
  color: string;
  tooltip: string;
  isUnique: boolean;
  lineIndex: number;
}

interface MergedSegment {
  text: string;
  groupIndex: number;
  color: string;
  tooltip: string;
  isUnique: boolean;
  lineIndexes: number[];
}

@Component({
  selector: 'kd-collation-cell-text',
  template: `
    @if(lines.length === 0) {
      <p>
        @if(orderInMs) {
          <span class="order-in-ms">|{{ orderInMs }}|</span>
        }
        @for (segment of mergedSegments; track $index; let segmentIndex = $index) {
          <span
            class="segment-token"
            [class.segment-colored]="segment.color !== 'transparent'"
            [class.highlighted-line]="isHighlighted(segment)"
            [ngStyle]="getSegmentStyle(segment)"
            [attr.data-group]="segment.groupIndex"
            [title]="segment.tooltip"
          >{{ segment.text }}</span>{{ segmentIndex < mergedSegments.length - 1 ? ' ' : '' }}
        }
      </p>
    } @else {
      <p>
        @if(orderInMs) {
          <span class="order-in-ms">|{{ orderInMs }}|</span>
        }
        @for (range of lines; track $index) {
          <span
            [ngStyle]="{
              color: range.color ? 'black' : undefined,
              'background-color': range.color
            }"
          >
            {{ range.text }}
          </span>
        }
      </p>
    }
  `,
  styles: [
    `
      p {
        margin: 0;
        padding: 0.1rem 0 0.2rem;
        font-size: inherit;
        line-height: 1.8;
        text-align: justify;
        text-align-last: auto;
        box-sizing: border-box;
        white-space: normal;
        overflow-wrap: break-word;
        hyphens: auto;
      }
      .order-in-ms {
        font-weight: bold;
        text-decoration: underline;
        margin-left: 0.5rem;
      }
      .highlighted-line {
        outline: 2px solid #f0b275;
        outline-offset: 1px;
      }
      .segment-token {
        display: inline;
        font-weight: inherit;
        border: none;
        outline: none;
        box-shadow: none;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;

        &.segment-colored {
          cursor: help;
          border: none;
          border-radius: 0;
          outline: none;
          /* Horizontal padding only — keeps word spaces colored without changing line spacing */
          padding: 0 2px;
          margin: 0;
        }
      }
    `,
  ],
  standalone: false,
})
export class CollationCellTextComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tokens: string[][] = [];
  @Input() lines: IRange[] = [];
  @Input() orderInMs: number | undefined = undefined;
  @Input() outOfOrder = false;
  @Input() siglum = '';
  @Input() unitIndex = 0;

  tokenSegments: TokenSegment[][] = [];
  mergedSegments: MergedSegment[] = [];

  private _highlightLine: number | undefined = undefined;
  private intervalId: any;

  @Input()
  get highlightLine(): number | undefined {
    return this._highlightLine;
  }

  set highlightLine(value: number | undefined) {
    this._highlightLine = value;
  }

  constructor(
    private segmentColorService: SegmentColorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.processTokens();

    this.intervalId = setInterval(() => {
      const wasAnalyzed = this.tokenSegments.some(line =>
        line.some(token => token.color !== 'transparent')
      );

      this.processTokens();

      const isNowAnalyzed = this.tokenSegments.some(line =>
        line.some(token => token.color !== 'transparent')
      );

      if (wasAnalyzed !== isNowAnalyzed) {
        this.cdr.detectChanges();
      }
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tokens'] || changes['siglum'] || changes['unitIndex']) {
      this.processTokens();
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private processTokens(): void {
    if (!this.segmentColorService.isUnitAnalyzed(this.unitIndex)) {
      this.tokenSegments = this.tokens.map((line, lineIndex) =>
        line.map(token => ({
          token,
          groupIndex: -999,
          color: 'transparent',
          tooltip: '',
          isUnique: false,
          lineIndex,
        }))
      );
      this.mergedSegments = this.mergeTokenSegments(this.tokenSegments);
      return;
    }

    let globalTokenIndex = 0;

    this.tokenSegments = this.tokens.map((line, lineIndex) => {
      return line.map((token) => {
        const segment = this.segmentColorService.getSegmentForPosition(
          this.unitIndex,
          this.siglum,
          globalTokenIndex
        );

        const tooltip = segment
          ? this.segmentColorService.getSegmentDescription(this.unitIndex, segment.groupIndex)
          : '';

        const result: TokenSegment = {
          token,
          groupIndex: segment?.groupIndex ?? -999,
          color: segment?.color || 'transparent',
          tooltip,
          isUnique: segment?.isUnique || false,
          lineIndex,
        };

        globalTokenIndex++;

        return result;
      });
    });

    this.mergedSegments = this.mergeTokenSegments(this.tokenSegments);
  }

  /** Merge consecutive tokens from the same group into one continuous highlight. */
  private mergeTokenSegments(lines: TokenSegment[][]): MergedSegment[] {
    const flat = lines.reduce<TokenSegment[]>((all, line) => all.concat(line), []);
    const merged: MergedSegment[] = [];

    for (const token of flat) {
      const previous = merged[merged.length - 1];
      const canMerge =
        previous &&
        previous.groupIndex === token.groupIndex &&
        previous.color === token.color &&
        token.color !== 'transparent';

      if (canMerge) {
        previous.text += ` ${token.token}`;
        if (!previous.lineIndexes.includes(token.lineIndex)) {
          previous.lineIndexes.push(token.lineIndex);
        }
      } else if (
        previous &&
        previous.color === 'transparent' &&
        token.color === 'transparent'
      ) {
        previous.text += ` ${token.token}`;
        if (!previous.lineIndexes.includes(token.lineIndex)) {
          previous.lineIndexes.push(token.lineIndex);
        }
      } else {
        merged.push({
          text: token.token,
          groupIndex: token.groupIndex,
          color: token.color,
          tooltip: token.tooltip,
          isUnique: token.isUnique,
          lineIndexes: [token.lineIndex],
        });
      }
    }

    return merged;
  }

  isHighlighted(segment: MergedSegment): boolean {
    return this._highlightLine !== undefined && segment.lineIndexes.includes(this._highlightLine);
  }

  getSegmentStyle(segment: MergedSegment): Record<string, string> {
    if (!segment.color || segment.color === 'transparent') {
      return {};
    }

    return {
      'background-color': segment.color,
      'border': 'none',
      'font-weight': 'inherit',
    };
  }
}
