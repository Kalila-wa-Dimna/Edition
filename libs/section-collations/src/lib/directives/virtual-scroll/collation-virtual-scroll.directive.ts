import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Directive, forwardRef, Input } from '@angular/core';
import { CollationVirtualScrollStrategy } from './collation-virtual-scroll-strategy';
import { CellSizingService } from '../../services/cell-sizing.service';
import { ICollationUnit } from '../../models/collation-page-data.model';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[kdCollationVirtualScroll]',
    providers: [
        {
            provide: VIRTUAL_SCROLL_STRATEGY,
            useFactory: (d: CollationVirtualScrollDirective) => d._scrollStrategy,
            deps: [forwardRef(() => CollationVirtualScrollDirective)],
        },
    ],
    standalone: false
})
export class CollationVirtualScrollDirective {
  _scrollStrategy = new CollationVirtualScrollStrategy(this.sizing);

  private _units: ICollationUnit[] = [];

  constructor(private sizing: CellSizingService) {}

  @Input()
  set units(value: ICollationUnit[] | null) {
    if (value && this._units.length !== value.length) {
      this._scrollStrategy.updateUnits(value);
      this._units = value;
    }
  }
}
