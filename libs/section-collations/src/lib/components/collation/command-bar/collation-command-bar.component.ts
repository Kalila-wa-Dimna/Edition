import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { CollationSettingsService } from '../../../services/collation-settings.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import {
  parseIfIndoArabicNumber,
  parseIfNumber,
} from '../../../util/parse-if-number';

@Component({
  selector: 'kd-collation-command-bar',
  templateUrl: './collation-command-bar.component.html',
  styleUrls: ['./collation-command-bar.component.scss'],
})
export class CollationCommandBarComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private settingsService: CollationSettingsService
  ) {}

  @Output() goToRow = new EventEmitter<number>();

  searchControl = new FormControl('');

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(100))
      .subscribe((value) => {
        const index =
          parseIfNumber(value ?? '') ?? parseIfIndoArabicNumber(value ?? '');
        if (index && index !== 0) {
          this.goToRow.emit(index - 1);
        }
      });
  }

  openSettingsDialog(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: this.settingsService.state$.getValue(),
      panelClass: 'responisve-dialog',
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.settingsService.apply(result);
      }
    });
  }
}
