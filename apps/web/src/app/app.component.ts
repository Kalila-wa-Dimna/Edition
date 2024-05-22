import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  StorageService,
  ThemeService,
  FacsimileWorkerService,
  SearchWorkerService,
} from '@kalila-edition/common-ui';

@Component({
  selector: 'kd-edition-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private themeService: ThemeService,
    private storageService: StorageService,
    private searchWorkerService: SearchWorkerService,
    private facsimileWorkerService: FacsimileWorkerService,
  ) { }

  async ngOnInit() {
    await this.storageService.initDb();
    await this.themeService.initTheme();
    this.initWorkers();
  }

  initWorkers() {
    if (typeof Worker !== 'undefined') {
      const facsimileWorker = new Worker(
        new URL('./facsimile.worker', import.meta.url)
      );
      const searchWorker = new Worker(
        new URL('./search.worker', import.meta.url)
      );

      this.searchWorkerService.init(searchWorker);
      this.facsimileWorkerService.init(facsimileWorker);
    }
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

  ngOnDestroy() {
    this.searchWorkerService.terminate();
    this.facsimileWorkerService.terminate();
  }
}

// nx g @nx/angular:web-worker mapPanelWorker --project=web
