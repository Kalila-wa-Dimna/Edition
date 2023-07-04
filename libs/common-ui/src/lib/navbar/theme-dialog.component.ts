// theme-dialog.component.ts

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'kalila-edition-theme-dialog',
  template: `
    <h1 mat-dialog-title>Choose a theme</h1>

    <mat-dialog-content>
      <mat-list>
        <mat-list-item (click)="onThemeSelect('light')">Light</mat-list-item>
        <mat-list-item (click)="onThemeSelect('dark')">Dark</mat-list-item>
        <mat-list-item (click)="onThemeSelect('system')">System</mat-list-item>
      </mat-list>
    </mat-dialog-content>
  `,
})
export class ThemeDialogComponent {
  constructor(public dialogRef: MatDialogRef<ThemeDialogComponent>) {}

  onThemeSelect(theme: string): void {
    this.dialogRef.close(theme);
  }
}
