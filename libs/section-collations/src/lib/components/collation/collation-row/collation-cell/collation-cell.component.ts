import { Component, Input } from '@angular/core';
import { ICellData } from '../../../../models/collation-row-data.model';
import { CollationSettingsService } from '../../../../services/collation-settings.service';
import { FacsimilePanelService } from '../../../../services/facsimile-panel.service';

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

  constructor(
    private settingsSerive: CollationSettingsService,
    private facsimilePanelService: FacsimilePanelService
  ) { }

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
}
