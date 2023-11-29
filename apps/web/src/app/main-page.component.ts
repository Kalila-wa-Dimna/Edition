import {Component, Inject} from '@angular/core';
import {CONFIG_TOKEN, IConfig} from "@kalila-edition/common-ui";
import { Router } from '@angular/router';
@Component({
  selector: 'kd-main-page',
  template: `
    <kd-layout>
      <span title>Kalīla wa-Dimna Edition</span>
      <main pageContent>

         <div class="container">
           <!--<div class="box" style="border: 0px">
             <div class="content">
             </div>
             <img style="width: 200%" src="{{ manuscriptEndPoint + 'about/headerbild.png' }}" alt="Box 2 Image">
           </div>
          Box 1 -->
          <div class="box">
            <div class="content">
              <p>Manuscripts</p>
              <p>Text </p>
              <button (click)="navigateTo('/manuscripts')">manuscripts</button>
            </div>
            <img src="{{ manuscriptEndPoint + 'about/manuscript.png' }}" alt="Box 2 Image">
          </div>

          <!-- Box 2 -->
          <div class="box">
            <div class="content">
              <p>Text for Box 2</p>
              <button (click)="navigateTo('/collations')">collations</button>
            </div>
            <img src="{{ manuscriptEndPoint + 'about/collation.png' }}" alt="Box 2 Image">
          </div>
          <!-- Add more boxes if needed -->
          <div class="box">
            <div class="content">
              <p>Text for Box 3</p>
              <button (click)="navigateTo('/manuscripts/CCCP578/McEnglish/228')">english translation</button>
            </div>
            <img src="{{ manuscriptEndPoint + 'about/translation.png' }}" alt="Box 2 Image">
          </div>
        </div>

        <div class="box">
          <div class="content">
            <p>Text for Box 2</p>
            <button (click)="navigateTo('/description')">description</button>
          </div>
          <img src="{{ manuscriptEndPoint + 'about/manuscript_description.png' }}" alt="Box 2 Image">
        </div>
        <div class="box">
          <div class="content">
            <p>Text for Box 2</p>
            <button (click)="navigateTo('/guides/dissemination-history')">dissemination history</button>
          </div>
          <img src="{{ manuscriptEndPoint + 'about/map.png' }}" alt="Box 2 Image">
        </div>
        <div class="box">
          <div class="content">
            <p>Text for Box 2</p>
            <button (click)="navigateTo('/manuscripts/P400/gallery')">gallery</button>
          </div>
          <img src="{{ manuscriptEndPoint + 'about/gallery.png' }}" alt="Box 2 Image">
        </div>
        <div class="box">
          <div class="content">
            <p>Text for Box 2</p>
            <button (click)="navigateTo('/manuscripts/illustrations')">illustrations</button>
          </div>
          <img src="{{ manuscriptEndPoint + 'about/illustration.png' }}" alt="Box 2 Image">
        </div>

      </main>
    </kd-layout>
  `,
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {

  manuscriptEndPoint = this.config.imagesEndPoint + 'manuscripts/';
  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private router: Router
  ) {

  }
  navigateTo(route: string) {
    // Navigates to the specified route
    this.router.navigate([route]);
  }
}
