import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ICollationViewSettings } from '../../../../models/collation-view-settings.model';

@Component({
    selector: 'kd-settings-dialog',
    templateUrl: './settings-dialog.component.html',
    styleUrls: ['./settings-dialog.component.scss'],
    standalone: false
})
export class SettingsDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ICollationViewSettings,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      size: [data.size],
      facsimilePreviw: [data.facsimilePreviw],
      showFacsimilePreview: [data.showFacsimilePreview],
      map: [data.map],
      showMap: [data.showMap],
      fullWidth: [data.fullWidth],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
