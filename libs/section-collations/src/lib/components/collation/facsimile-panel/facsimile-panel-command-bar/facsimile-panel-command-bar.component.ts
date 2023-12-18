import { Component } from "@angular/core";
import { FacsimilePanelService } from '../../../../services/facsimile-panel.service';

// Your code here
@Component({
  selector: 'kd-facsimile-panel-command-bar',
  template: `

  <mat-icon matTooltip="(1)You can view facsimile from up to 20 cells. (2)Double click an image preview to scroll to its row." fontIcon="info" matTooltipPosition="above"></mat-icon>
    <button [disabled]="stageDataUrl() === undefined" (click)="onExport()" mat-button>
      <mat-icon>download</mat-icon> Export
    </button>
    <button (click)="onRemoveAll()" mat-button>
      <mat-icon>tab_close</mat-icon> Clear
    </button>


  `,
  styleUrls: ['./facsimile-panel-command-bar.component.scss']
})
export class FacsimilePanelCommandBarComponent {

  constructor(private facsimilePanleService: FacsimilePanelService) { }

  stageDataUrl = this.facsimilePanleService.stageDataUrl;

  onRemoveAll() {
    this.facsimilePanleService.removeAllUnits();
  }

  onExport() {
    const link = document.createElement('a');
    link.download = "kwd_facsimile_panel.png";
    link.href = this.stageDataUrl()!;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
