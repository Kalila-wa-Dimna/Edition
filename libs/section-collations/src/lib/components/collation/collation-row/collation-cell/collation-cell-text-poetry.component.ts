import { Component, Input } from '@angular/core';
import { IRange } from './models';

@Component({
  selector: 'kd-collation-cell-poetry-text',
  template: `
    @if(lines.length === 0) {
    <p>
      @if(orderInMs) {
      <span class="order-in-ms">|{{ orderInMs }}|</span>
      } @for (lineTokens of tokens; track $index) {
      <span [innerHTML]="formatLine(lineTokens ?? [], $index)"></span>
      }
    </p>
    } @else {
    <p>
      @if(orderInMs) {
      <span class="order-in-ms">|{{ orderInMs }}|</span>
      } @for (range of lines; track $index) {
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
    `,
  ],
  standalone: false,
})
export class CollationCellTextPoetryComponent {
  @Input() tokens: string[][] = [];
  @Input() lines: IRange[] = [];
  @Input() orderInMs: number | undefined = undefined;

  formatLine(lineTokens: string[], index: number): string {
    if (lineTokens[0] && lineTokens[0].startsWith('|') && index === 0) {
      lineTokens[0] = lineTokens[0].slice(1);
    }

    let line = lineTokens.join(' ');

    line = line.replace(/\|/g, '<br>');

    // Replace '###' with line breaks
    return line.replace(/###/g, '<br>&nbsp;&nbsp;&nbsp;&nbsp;');
  }
}

// smaller facsimile frames,
// make facsimiles initially bigger
// remove spaces from out-of-order marks
// continue the poetry display improvements, work-in the cell sizing
// add facsimle on hover
// map export
// The current unit row highlighter does not show te correct position when it first toggled
//  other map views: side view and expanded view
