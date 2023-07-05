import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { StorageService } from '../storage/storage.service';
import { isPlatformBrowser } from '@angular/common';

type Theme = 'light' | 'dark' | 'system';
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private active: Theme = 'system';
  private readonly LIGHT_THEME_CLASS = 'light-theme';
  private readonly DARK_THEME_CLASS = 'dark-theme';

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private overlayContainer: OverlayContainer,
    private storageService: StorageService
  ) {}

  async initTheme() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const theme = await this.storageService.getOption<Theme>(
          'theme',
          'system'
        );

        if (theme) {
          this.active = theme;
          this.updateThemeClass(
            theme === 'dark' ? this.DARK_THEME_CLASS : this.LIGHT_THEME_CLASS
          );
        } else {
          const isDarkModePreferred =
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches;

          if (isDarkModePreferred) {
            this.setDarkMode();
          } else {
            this.setLightMode();
          }
        }
      } catch (error) {
        console.error('Error', error);
      }
    }
  }

  setLightMode() {
    this.active = 'light';
    this.updateThemeClass(this.LIGHT_THEME_CLASS);
    this.storageService.setOption<Theme>('theme', 'light');
  }

  setDarkMode() {
    this.active = 'dark';
    this.updateThemeClass(this.DARK_THEME_CLASS);
    this.storageService.setOption<Theme>('theme', 'dark');
  }

  setSystemDefault() {
    this.active = 'system';
    this.storageService.setOption<Theme>('theme', 'system');
    const isDarkModePreferred =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDarkModePreferred) {
      this.setDarkMode();
    } else {
      this.setLightMode();
    }
  }

  private updateThemeClass(themeClass: string) {
    this.overlayContainer
      .getContainerElement()
      .classList.remove(this.LIGHT_THEME_CLASS, this.DARK_THEME_CLASS);
    this.overlayContainer.getContainerElement().classList.add(themeClass);
    document.body.classList.remove(
      this.LIGHT_THEME_CLASS,
      this.DARK_THEME_CLASS
    );
    document.body.classList.add(themeClass);
  }

  getActiveTheme() {
    return this.active;
  }
}
