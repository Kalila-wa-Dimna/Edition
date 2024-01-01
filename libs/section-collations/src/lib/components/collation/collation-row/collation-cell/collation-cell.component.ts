import { Component, Input, computed } from '@angular/core';
import { ICellData } from '../../../../models/collation-row-data.model';
import { CollationSettingsService } from '../../../../services/collation-settings.service';
import { FacsimilePanelService } from '../../../../services/facsimile-panel.service';
import { SearchService } from '../../../../services/search.service';
import { IRange, IRangeDefinition } from './models';



@Component({
  selector: 'kd-collation-cell',
  templateUrl: './collation-cell.component.html',
  styleUrls: ['./collation-cell.component.scss'],
})
export class CollationCellComponent {
  @Input() data?: ICellData;
  @Input() siglum: string = '';
  @Input() orderDisplay: string = '';
  @Input() unitIndex: number = 0;
  @Input() mediumIndex: number = 0;

  showFacsimilePreview$ = this.settingsSerive.showFacsimilePreview$;

  highlightedRanges = computed(() => {
    const results = this.searchService.highlightedTokens();
    if (results) {
      const currentResult = this.searchService.currentResult();
      const cellResults: IRangeDefinition[] = []
      results.forEach((result, index) => {
        if (result[0] === this.unitIndex && result[1] === this.mediumIndex) {
          cellResults.push({
            start: [result[2], result[3]],
            end: [result[4], result[5]],
            color: index === currentResult ? '#f0b275' : '#ffdfbf'
          });
        }
      })


      return cellResults.length > 0 ? cellResults : null;
    }


    return null;
  });

  constructor(
    private settingsSerive: CollationSettingsService,
    private facsimilePanelService: FacsimilePanelService,
    private searchService: SearchService,
  ) {

  }

  facsimilePanelIcon(): string {
    if (!this.data) {
      return '';
    }

    if (this.facsimilePanelService.hasUnit(this.unitIndex, this.siglum)) {
      return 'visibility';
    }

    if (
      !this.facsimilePanelService.hasUnit(this.unitIndex, this.siglum) &&
      this.facsimilePanelService.canAddUnit()
    ) {
      return 'visibility_off';
    }

    return '';
  }

  toggleFacimileInPanle() {
    if (!this.data) {
      return;
    }
    const { mediumId, lines, pages } = this.data;
    if (
      !this.facsimilePanelService.hasUnit(this.unitIndex, this.siglum) &&
      this.facsimilePanelService.canAddUnit()
    ) {
      this.facsimilePanelService.addUnit(this.unitIndex, this.orderDisplay, this.siglum, this.mediumIndex, mediumId, pages, lines);
    } else if (this.facsimilePanelService.hasUnit(this.unitIndex, this.siglum)) {
      this.facsimilePanelService.removeUnit(this.unitIndex, this.siglum);
    }
  }

  lines  = computed(() => {
    const { tokens } = this.data ?? {};
    const rangeDefinitions = this.highlightedRanges();
    if (!tokens || !rangeDefinitions) {
      return [];
    }

    const ranges: IRange[] = [];

    const getRangeContiningWord = (lineIndex: number, wordIndex: number) => {
      for (let i = 0; i < rangeDefinitions.length; i++) {
        const range = rangeDefinitions[i];
        if (range.start[0] <= lineIndex && range.end[0] >= lineIndex) {
          if (range.start[0] === lineIndex && range.start[1] > wordIndex) {
            continue;
          }
          if (range.end[0] === lineIndex && range.end[1] < wordIndex) {
            continue;
          }
          return range;
        }
      }
      return null;
    };

    tokens.forEach((line, lineIndex) => {
      line.forEach((word, wordIndex) => {
        const rageContiningWord = getRangeContiningWord(lineIndex, wordIndex);
        if (rageContiningWord) {
          ranges.push({
            text: word,
            color: rageContiningWord.color
          })
        } else {
          ranges.push({
            text: word,
          })
        }

      })
    })
    return ranges;
  })
}
