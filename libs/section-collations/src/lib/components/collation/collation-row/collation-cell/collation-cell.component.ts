import { Component, Input } from '@angular/core';
import { ICellData } from '../../../../models/collation-row-data.model';
import { CollationSettingsService } from '../../../../services/collation-settings.service';
import { FacsimilePanelService } from '../../../../services/facsimile-panel.service';
import {
  CollationDataService,
  SequenceArrow,
} from '../../../../services/collation-data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { RobotService } from '../../../../services/robot.service';

@Component({
  selector: 'kd-collation-cell',
  templateUrl: './collation-cell.component.html',
  styleUrls: ['./collation-cell.component.scss'],
  standalone: false,
})
export class CollationCellComponent {
  @Input() siglum = '';
  @Input() orderDisplay = '';
  @Input() unitIndex = 0;
  /** 0-based index in segment_data / units array. */
  @Input() unitArrayIndex = 0;
  @Input() mediumIndex = 0;
  @Input() chapterSiglum = '';

  showFacsimilePreview$ = this.settingsSerive.showFacsimilePreview$;
  highlightedLine = toSignal(this.facsimilePanelService.currentCellLine);

  pages: number[] = [];
  pageData?: ICellData;

  @Input()
  set data(value: ICellData | undefined) {
    this.pageData = value;
    this.pages = [...new Set(value?.pages || [])];
  }

  constructor(
    private settingsSerive: CollationSettingsService,
    private facsimilePanelService: FacsimilePanelService,
    private robotService: RobotService,
    private dataService: CollationDataService
  ) {}

  /** Manuscript order position shown next to the page link (1-based). */
  orderInMsDisplay(): number | null {
    if (this.pageData?.orderInMs == null) {
      return null;
    }
    return this.pageData.orderInMs + 1;
  }

  /**
   * Arrow only when this MS truly reorders units vs the collation.
   * (Old check used adjustedOrder vs unit.order and false-fired on Lo-h.)
   */
  sequenceArrow(): SequenceArrow | null {
    if (!this.pageData || this.pageData.lacuna) {
      return null;
    }
    return this.dataService.sequenceArrow(this.siglum, this.unitArrayIndex);
  }

  facsimilePanelIcon(): string {
    if (!this.pageData) {
      return '';
    }

    if (this.facsimilePanelService.hasUnit(this.unitIndex, this.siglum)) {
      return 'visibility';
    }

    return 'visibility_off';
  }

  editionsWithOutLinks = new Set(['IH', 'Cheikho']);
  hasLinks() {
    return !this.editionsWithOutLinks.has(this.siglum);
  }

  cellHighlightedLine() {
    if (this.facsimilePanelService.hasUnit(this.unitIndex, this.siglum)) {
      return this.highlightedLine();
    }
    return undefined;
  }

  toggleFacimileInPanle() {
    if (!this.pageData) {
      return;
    }
    const { mediumId, lines, pages } = this.pageData;
    const hasUnit = this.facsimilePanelService.hasUnit(
      this.unitIndex,
      this.siglum
    );
    if (!hasUnit) {
      this.facsimilePanelService.addUnit(
        this.unitIndex,
        this.orderDisplay,
        this.siglum,
        this.mediumIndex,
        mediumId,
        pages,
        lines
      );
    } else {
      this.facsimilePanelService.removeUnit(this.unitIndex, this.siglum);
    }
  }

  updateChapterSiglum(chapterSiglum: string): string {
    // Collation ids can be chapter variants (Lo-h, Di-4-1, Di_s).
    // Manuscript routes always use the base chapter code (Lo, Di, …).
    if (chapterSiglum === 'ToC') {
      return 'toc';
    }
    const baseChapter = chapterSiglum.match(/^[A-Za-z]{2}/)?.[0];
    return baseChapter ?? chapterSiglum;
  }

  get formattedChapterSiglum(): string {
    const chapterSiglum = this.updateChapterSiglum(this.chapterSiglum);
   // console.log(chapterSiglum);
    return chapterSiglum;
  }

  isClicked = false;

  toggleIconColor(): void {
    this.isClicked = !this.isClicked;
  }

  loadingTranslation = false;
  cellTranslations: { [key: string]: string } = {};

  translateCell() {
    if (!this.pageData) return;

    const key = `${this.unitIndex}-${this.mediumIndex}-${this.siglum}`;

    if (this.cellTranslations[key]) {
      this.cellTranslations[key] = '';
      return;
    }

    const textToTranslate = this.pageData.tokens
      .map(line => line.join(' '))
      .join(' ');

    this.loadingTranslation = true;

    this.robotService.sendText(textToTranslate);

    const sub = this.robotService.response$.subscribe((res: string) => {
      this.cellTranslations[key] = res;
      this.loadingTranslation = false;
      sub.unsubscribe();
    });
  }

  get translation(): string | null {
    const key = `${this.unitIndex}-${this.mediumIndex}-${this.siglum}`;
    return this.cellTranslations[key] || null;
  }
}
