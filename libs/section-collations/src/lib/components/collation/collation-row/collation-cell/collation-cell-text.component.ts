import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { IRange } from './models';
import { SegmentColorService } from '../../../../services/segment-color.service';

@Component({
  selector: 'kd-collation-cell-text',
  template: `
    @if(lines.length === 0) {
      <p>
        @if(orderInMs) {
          <span class="order-in-ms">|{{ orderInMs }}|</span>
        }
        @for (line of tokenSegments; track $index; let lineIndex = $index) {
          <span [class.highlighted-line]="highlightLine === lineIndex">
            @for (tokenData of line; track $index; let tokenIndex = $index) {
              <span
                class="segment-token"
                [ngStyle]="getTokenStyle(lineIndex, tokenIndex)"
                [attr.data-segment]="tokenData.segmentId"
              >{{ tokenData.token }}</span>{{ tokenIndex < line.length - 1 ? ' ' : '' }}
            }
          </span>
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
        padding: 0;
        font-size: inherit;
      }
      .order-in-ms {
        font-weight: bold;
        text-decoration: underline;
      }
      .highlighted-line {
        background-color: #ffdfbf;
        color: black;
      }
      .segment-token {
        display: inline;
        transition: background-color 0.3s ease;
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
  @Input() siglum: string = '';
  @Input() unitIndex: number = 0;

  tokenSegments: Array<Array<{ token: string; segmentId: string; color: string }>> = [];

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

  ngOnInit() {
    this.processTokens();

    // Poll for analysis updates every 500ms
    this.intervalId = setInterval(() => {
      const wasAnalyzed = this.tokenSegments.some(line =>
        line.some(token => token.color !== 'transparent')
      );

      this.processTokens();

      const isNowAnalyzed = this.tokenSegments.some(line =>
        line.some(token => token.color !== 'transparent')
      );

      // Only trigger change detection if analysis state changed
      if (wasAnalyzed !== isNowAnalyzed) {
        this.cdr.detectChanges();
      }
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tokens'] || changes['siglum'] || changes['unitIndex']) {
      this.processTokens();
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private processTokens() {
    // Check if this unit has been analyzed
    if (!this.segmentColorService.isUnitAnalyzed(this.unitIndex)) {
      // No analysis - create plain tokens
      this.tokenSegments = this.tokens.map(line =>
        line.map(token => ({
          token,
          segmentId: '',
          color: 'transparent'
        }))
      );
      return;
    }

    // Unit has been analyzed - apply segment colors
    this.tokenSegments = this.tokens.map((line, lineIndex) => {
      return line.map((token, tokenIndex) => {
        const segment = this.segmentColorService.getSegmentForPosition(
          this.unitIndex,
          this.siglum,
          lineIndex,
          tokenIndex
        );

        return {
          token,
          segmentId: segment?.segmentId || '',
          color: segment?.color || 'transparent',
        };
      });
    });
  }

  getTokenStyle(lineIndex: number, tokenIndex: number) {
    const segment = this.tokenSegments[lineIndex]?.[tokenIndex];
    if (!segment || !segment.color || segment.color === 'transparent') {
      return {};
    }

    return {
      'background-color': segment.color,
      'border-radius': '3px',
      'padding': '2px 4px',
      'margin': '0 2px',
    };
  }
}
