import { Component } from '@angular/core';

@Component({
  selector: 'kd-main-page',
  template: `
    <kd-layout>
      <span title>Kalīla wa-Dimna Edition</span>
      <main pageContent>
        <h1>Main Page</h1>
      </main>
    </kd-layout>
  `,
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {}
