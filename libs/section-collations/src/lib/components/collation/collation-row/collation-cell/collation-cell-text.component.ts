import { Component, Input } from '@angular/core';
import { IRange } from './models';

@Component({
  selector: 'kd-collation-cell-text',
  template: `
 @if(lines.length === 0) {
        <p>
          @if(orderInMs) {
            <span class="order-in-ms">| {{ orderInMs }} |</span>
          }
          @for (lineTokens of tokens; track $index) {
            <span>
              {{ lineTokens.join(' ') }}
            </span>
          }
        </p>
      } @else {
        <p>
          @if(orderInMs) {
            <span  class="order-in-ms">| {{ orderInMs }} |</span>
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

    `
  ]
})
export class CollationCellTextComponent {

  @Input() tokens: string[][] = []
  @Input() lines: IRange[] = []
  @Input() orderInMs: number | undefined = undefined
}
