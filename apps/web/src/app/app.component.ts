import { Component, OnInit } from '@angular/core';
import { StorageService, ThemeService } from '@kalila-edition/common-ui';

@Component({
  selector: 'kd-edition-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    await this.storageService.initDb();
    await this.themeService.initTheme();
  }

  setLightMode() {
    this.themeService.setLightMode();
  }

  setDarkMode() {
    this.themeService.setDarkMode();
  }

  setSystemDefault() {
    this.themeService.setSystemDefault();
  }
}
