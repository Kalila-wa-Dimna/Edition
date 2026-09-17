import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ICollationViewSettings } from '../models/collation-view-settings.model';
import { StorageService } from '@kalila-edition/common-ui';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, ReplaySubject, filter, map } from 'rxjs';
import {
  SIZE_MAP,
  recommendedSizeForColumns,
} from '../constants/size.constants';

const DEFAULT: ICollationViewSettings = {
  size: 'lg',
  facsimilePreviw: 'permanent',
  map: 'bottom',
  fullWidth: false,
  showFacsimilePreview: false,
  showMap: false,
  visibleColumns: {}
};

@Injectable()
export class CollationSettingsService {
  state$: BehaviorSubject<ICollationViewSettings> = new BehaviorSubject(
    DEFAULT
  );

  currentScrollIndex = new ReplaySubject<number>(1);
  stateObservable$ = this.state$
    .asObservable()
    .pipe(filter((value) => value !== null && value !== undefined));

  isMainFullWidth$ = this.stateObservable$.pipe(
    map(({ fullWidth }) => fullWidth)
  );

  cellWidth$ = this.stateObservable$.pipe(
    map(({ size }) => SIZE_MAP[size].cell)
  );

  fontSize$ = this.stateObservable$.pipe(
    map(({ size }) => SIZE_MAP[size].font)
  );

  visibleColumns$ = this.stateObservable$.pipe(map(({ visibleColumns }) => visibleColumns));

  showFacsimilePreview$ = this.stateObservable$.pipe(map(({ showFacsimilePreview }) => showFacsimilePreview));
  showMap$ = this.stateObservable$.pipe(map(({ showMap }) => showMap));

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private storageService: StorageService
  ) { }

  async init() {
    await this.storageService.initDb();
    if (isPlatformBrowser(this.platformId)) {
      const state = await this.storageService.getOption<ICollationViewSettings>(
        'collationSettings',
        DEFAULT
      );
      if (state) {
        this.state$.next(state);
      } else {
        await this.storageService.setOption<ICollationViewSettings>(
          'collationSettings',
          DEFAULT
        );
      }
    }
  }

  /**
   * When the number of manuscripts changes, pick a fitting size
   * (e.g. 4 columns → LG). Manual settings overrides still work via apply().
   */
  async syncSizeToColumnCount(columnCount: number) {
    if (columnCount < 1) {
      return;
    }
    const recommended = recommendedSizeForColumns(columnCount);
    const current = this.state$.getValue();
    if (current.size === recommended) {
      return;
    }
    await this.apply({ ...current, size: recommended });
  }

  async apply(newSettings: ICollationViewSettings) {
    this.state$.next(newSettings);
    await this.storageService.setOption<ICollationViewSettings>(
      'collationSettings',
      newSettings
    );
  }
}
