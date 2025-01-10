import { Component } from '@angular/core';

@Component({
    selector: 'kd-section-help',
    template: ` <kd-layout>
    <span title>
      <router-outlet name="title"></router-outlet>
    </span>
    <main pageContent>
      <router-outlet name="content"></router-outlet>
    </main>
  </kd-layout>`,
    styleUrl: './section-help.component.scss',
    standalone: false
})
export class SectionHelpComponent { }
