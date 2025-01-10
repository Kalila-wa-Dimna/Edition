import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA,  MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-illustration-modal',
    template: `
    <img [src]="data.illustration" alt="Illustration">
    <button mat-button (click)="closeDialog()">Close</button>
  `,
    standalone: false
})
export class IllustrationModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { illustration: string },
    private dialogRef: MatDialogRef<IllustrationModalComponent>
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
