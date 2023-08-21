import { Component } from '@angular/core';

@Component({
  selector: 'kd-section-help',
  template: ` <kd-layout>
    <span title>Kalila-wa-Dimna Edition</span>
    <main pageContent>
      <h1>Help</h1>
    </main>
  </kd-layout>`,
  styles: [
    `
      main {
        flex-grow: 1;
      }
    `,
  ],
})
export class SectionHelpComponent {}
