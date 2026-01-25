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
                [attr.data-group]="tokenData.groupIndex"
                [title]="tokenData.tooltip"
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
        line-height: 1.8;
      }
      .order-in-ms {
        font-weight: bold;
        text-decoration: underline;
        margin-left: 0.5rem;
      }
      .highlighted-line {
        background-color: #ffdfbf;
        color: black;
      }
      .segment-token {
        display: inline;
        transition: background-color 0.3s ease, transform 0.2s ease;
        cursor: help;

        &:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
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

  tokenSegments: Array<Array<{
    token: string;
    groupIndex: number;
    color: string;
    tooltip: string;
    isUnique: boolean;
  }>> = [];

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
      // No analysis - create plain tokens
      this.tokenSegments = this.tokens.map(line =>
        line.map(token => ({
          token,
          groupIndex: -999,
          color: 'transparent',
          tooltip: '',
          isUnique: false
        }))
      );
      return;
    }

    // Flatten tokens to get global index
    let globalTokenIndex = 0;

    // Unit has been analyzed - apply group colors
    this.tokenSegments = this.tokens.map((line, lineIndex) => {
     // console.log(`  Line ${lineIndex}: ${line.length} tokens`);

      return line.map((token, tokenIndexInLine) => {
        const segment = this.segmentColorService.getSegmentForPosition(
          this.unitIndex,
          this.siglum,
          globalTokenIndex
        );

        const tooltip = segment
          ? this.segmentColorService.getSegmentDescription(this.unitIndex, segment.groupIndex)
          : '';

        const result = {
          token,
          groupIndex: segment?.groupIndex ?? -999,
          color: segment?.color || 'transparent',
          tooltip,
          isUnique: segment?.isUnique || false
        };

        // Debug log
        if (segment && segment.color !== 'transparent') {
      //    console.log(`    ✅ Token ${globalTokenIndex} "${token}": group ${segment.groupIndex}, color: ${segment.color}, unique: ${segment.isUnique}`);
        }

        globalTokenIndex++; // Increment after each token

        return result;
      });
    });

  //  console.log(`✅ Processed ${globalTokenIndex} total tokens for ${this.siglum}`);

    // Count colored tokens
    const coloredCount = this.tokenSegments.flat().filter(t => t.color !== 'transparent').length;
   // console.log(`🎨 ${coloredCount} tokens have colors`);
  }

  getTokenStyle(lineIndex: number, tokenIndex: number): any {
    const segment = this.tokenSegments[lineIndex]?.[tokenIndex];
    if (!segment || !segment.color || segment.color === 'transparent') {
      return {};
    }

    const baseStyle = {
      'background-color': segment.color,
      'border-radius': '3px',
      'padding': '2px 4px',
      'margin': '0 2px',
    };

    // Add extra styling for unique tokens
    if (segment.isUnique) {
      return {
        ...baseStyle,
        'font-weight': '600',
      };
    }

    return baseStyle;
  }
}
