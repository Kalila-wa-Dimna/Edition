import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'kd-nav-panel',
  templateUrl: './nav-panel.component.html',
  styleUrls: ['./nav-panel.component.scss'],
})
export class NavPanelComponent implements OnInit {
  @Output() closeClicked = new EventEmitter();
  expanded = {
    collationPanelOpen: false,
    manuscriptPanelOpen: false,
    englishCollationPanelOpen:false,
    guidesPanelOpen: false,
  };

  constructor(private route: ActivatedRoute, private router: Router) {}
  ngOnInit(): void {

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEndEvent = event as NavigationEnd;
        const current = navigationEndEvent.urlAfterRedirects;
        if (current.includes('/manuscripts/')) {
          this.expanded = {
            ...this.expanded,
            manuscriptPanelOpen: true,
          };
        }
      });
  }
}
