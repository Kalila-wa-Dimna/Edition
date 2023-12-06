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

  showFacsimilePreview$ = this.settingsSerive.showFacsimilePreview$;

  constructor(
    private settingsSerive: CollationSettingsService,
    private facsimilePanelService: FacsimilePanelService
  ) { }

  facsimilePanelIcon(): string {
    if (!this.data) {
      return '';
    }

    const { unitId } = this.data;

    if (this.facsimilePanelService.hasUnit(unitId, this.siglum)) {
      return 'visibility';
    }

    if (
      !this.facsimilePanelService.hasUnit(unitId, this.siglum) &&
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
    const { mediumId, unitId, lines, pages } = this.data;
    if (
      !this.facsimilePanelService.hasUnit(unitId, this.siglum) &&
      this.facsimilePanelService.canAddUnit()
    ) {
      this.facsimilePanelService.addUnit(unitId, this.siglum, mediumId, pages, lines);
    } else if (this.facsimilePanelService.hasUnit(unitId, this.siglum)) {
      this.facsimilePanelService.removeUnit(unitId, this.siglum);
    }
  }
}
