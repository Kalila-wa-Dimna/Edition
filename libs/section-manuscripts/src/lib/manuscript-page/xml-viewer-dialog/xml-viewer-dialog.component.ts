import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManuscriptDownloadsService } from '../../services/manuscript-downloads.service';

export interface XmlViewerDialogData {
  xml: string;
  filename: string;
  title?: string;
}

@Component({
  selector: 'kd-xml-viewer-dialog',
  templateUrl: './xml-viewer-dialog.component.html',
  styleUrls: ['./xml-viewer-dialog.component.scss'],
  standalone: false,
})
export class XmlViewerDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<XmlViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: XmlViewerDialogData,
    private downloads: ManuscriptDownloadsService
  ) {}

  download(): void {
    this.downloads.downloadXml(this.data.xml, this.data.filename);
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.data.xml);
    } catch {
      // ignore clipboard failures
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
