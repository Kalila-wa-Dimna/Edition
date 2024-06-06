import { Component, computed } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FacsimilePanelService } from '../../../../services/facsimile-panel.service';
import { CollationSettingsService } from "../../../../services/collation-settings.service";

// Your code here
@Component({
  selector: 'kd-facsimile-panel-command-bar',
  template: `


    <div class="line-switcher">

    @if (cellInformation() === undefined) {
      <p>Select a cell to preview</p>
    } @else {
      <p>{{ cellInformation() }} has {{ lineNumberStatement() }}</p>

      @if (numberOfLines() > 1) {

        <button [disabled]="currentLineNumber() === 0" (click)="onPreviousLine()" mat-button>
      <mat-icon>chevron_left</mat-icon>
    </button>
    <button [disabled]="currentLineNumber() === numberOfLines() - 1" (click)="onNextLine()" mat-button>
      <mat-icon>chevron_right</mat-icon>
    </button>
      }

    }

    </div>
    <div class="other-controls">
    <button  class="big-button" [disabled]="stageDataUrl() === undefined" (click)="onExport()" mat-button>
      <mat-icon>download</mat-icon> <span class="button-label">Export</span>
    </button>
    <button  class="big-button" (click)="onRemoveAll()" mat-button>
      <mat-icon>close</mat-icon> <span class="button-label">Close</span>
    </button>

     <mat-icon (click)="onExport()" class="small-button">download</mat-icon>
     <mat-icon (click)="onRemoveAll()" class="small-button">close</mat-icon>

    </div>





  `,
  styleUrls: ['./facsimile-panel-command-bar.component.scss']
})
export class FacsimilePanelCommandBarComponent {

  constructor(private facsimilePanleService: FacsimilePanelService, private settingsService: CollationSettingsService) { }

  stageDataUrl = this.facsimilePanleService.stageDataUrl;

  numberOfLines = this.facsimilePanleService.numberOfLines;
  cellInformation = this.facsimilePanleService.cellInformation;
  currentLineNumber = toSignal(this.facsimilePanleService.currentCellLine);

  lineNumberStatement = computed(() => {
    const numberOfLines = this.numberOfLines();

    if (numberOfLines === 1) {
      return "1 line";
    }
    const shownLine = (this.currentLineNumber() ?? 0) + 1
    return `${numberOfLines} lines, showing line ${shownLine}`;
  });

  onRemoveAll() {
    this.facsimilePanleService.removeAllUnits();
    this.facsimilePanleService.currentCellLine.next(0);
    const oldValue = this.settingsService.state$.getValue();
    this.settingsService.apply({
      ...oldValue,
      showFacsimilePreview: false,
      showMap: false,
    });
  }

  onExport() {
    const link = document.createElement('a');
    link.download = "kwd_facsimile_panel.png";
    link.href = this.stageDataUrl()!;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onPreviousLine() {
    const currentLineNumber = this.currentLineNumber() ?? 1;
    this.facsimilePanleService.currentCellLine.next(currentLineNumber - 1);
  }

  onNextLine() {
    const currentLineNumber = this.currentLineNumber() ?? 0;
    this.facsimilePanleService.currentCellLine.next(currentLineNumber + 1);
  }

}
