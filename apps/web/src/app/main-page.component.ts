import { Component } from '@angular/core';

@Component({
  selector: 'kd-main-page',
  template: `
    <kd-navbar>
      <span title>Kalila-wa-Dimna Edition</span>
      <a pageControls routerLink="/collations">Collations </a>
    </kd-navbar>
    <main>
      <h1>Main Page</h1>
    </main>
  `,
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {}
