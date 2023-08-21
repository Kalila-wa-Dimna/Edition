import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from '../theme/theme.service';
import { NavigationStart, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'kd-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  logoViewBox = '0 0 720 720';
  logoColor = 'red';
  sub?: Subscription;
  @ViewChild(MatSidenav) sideNavRef?: MatSidenav;
  constructor(private themeService: ThemeService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => {
        if (this.sideNavRef) {
          this.sideNavRef.close();
        }
      });
  }

  activeTheme$ = this.themeService.active$.asObservable();
  onThemeSelect(theme: string): void {
    if (theme === 'light') {
      this.themeService.setLightMode();
    } else if (theme === 'dark') {
      this.themeService.setDarkMode();
    } else {
      this.themeService.setSystemDefault();
    }
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
