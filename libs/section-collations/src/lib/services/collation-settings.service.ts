import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ICollationViewSettings } from '../models/collation-view-settings.model';
import { StorageService } from '@kalila-edition/common-ui';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, filter, map } from 'rxjs';
import { CELL_WIDTH_MAP } from '../constants/cell-width.constants';
import { FONT_SIZE_MAP } from '../constants/font-size.constants';

const DEFAULT: ICollationViewSettings = {
  cellWidth: 'md',
  fontSize: 'md',
  facsimilePreviw: 'permanent',
  map: 'bottom',
  fullWidth: false,
  showFacsimilePreview: false,
  showMap: false,
};

@Injectable()
export class CollationSettingsService {
  state$: BehaviorSubject<ICollationViewSettings> = new BehaviorSubject(
    DEFAULT
  );

  stateObservable$ = this.state$
    .asObservable()
    .pipe(filter((value) => value !== null && value !== undefined));

  isMainFullWidth$ = this.stateObservable$.pipe(
    map(({ fullWidth }) => fullWidth)
  );

  cellWidth$ = this.stateObservable$.pipe(
    map(({ cellWidth }) => CELL_WIDTH_MAP[cellWidth])
  );

  fontSize$ = this.stateObservable$.pipe(
    map(({ fontSize }) => FONT_SIZE_MAP[fontSize])
  );

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private storageService: StorageService
  ) {}

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

  async apply(newSettings: ICollationViewSettings) {
    this.state$.next(newSettings);
    await this.storageService.setOption<ICollationViewSettings>(
      'collationSettings',
      newSettings
    );
  }
}
