import { Component, OnDestroy, OnInit, ViewChild, Input, Inject } from '@angular/core';
import { ThemeService } from '../theme/theme.service';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationStart, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { CONFIG_TOKEN, IConfig } from '../config.module';

interface IPathElement {
  display: string;
  link: string;
}

@Component({
  selector: 'kd-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  @Input() dataManuscriptEndPoint!: string;
  logoViewBox = '0 0 720 720';
  logoColor = 'red';
  sub?: Subscription;
  sub2?: Subscription;
  activeTheme$ = this.themeService.active$.asObservable();
  pathElements: IPathElement[] = [];
  @ViewChild(MatSidenav) sideNavRef?: MatSidenav;
  constructor(private themeService: ThemeService, private router: Router, private route: ActivatedRoute, @Inject(CONFIG_TOKEN) private config: IConfig,) { }

  ngOnInit(): void {


    this.getPath(this.route.snapshot.pathFromRoot);

    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => {
        if (this.sideNavRef) {
          this.sideNavRef.close();
        }
      });


  }

  getPath(data: ActivatedRouteSnapshot[]) {
    const parts = data.map((r) => r.url[0]?.path).filter((p) => !!p);
    if (parts.length === 1) {
      this.pathElements = [{ display: `KwD Edition (v.${this.config.version})`, link: '/' }]
    } else if (parts.length > 1) {
      const visibale = parts.slice(0, parts.length - 1);
      this.pathElements = [{ display: `KwD Edition (v.${this.config.version})`, link: '/' }, ...visibale.map((p) => ({ display: p, link: `/${p}` }))]
    }

  }

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

    if (this.sub2) {
      this.sub2.unsubscribe();
    }
  }
}
