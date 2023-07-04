import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ThemeService } from '../theme/theme.service';
import { ThemeDialogComponent } from './theme-dialog.component';

@Component({
  selector: 'kd-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(private dialog: MatDialog, private themeService: ThemeService) {}

  openThemeDialog(): void {
    const dialogRef = this.dialog.open(ThemeDialogComponent);

    dialogRef.afterClosed().subscribe((theme) => {
      if (theme === 'light') {
        this.themeService.setLightMode();
      } else if (theme === 'dark') {
        this.themeService.setDarkMode();
      } else {
        this.themeService.setSystemDefault();
      }
    });
  }
}
