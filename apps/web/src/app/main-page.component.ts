import { Component, Inject } from '@angular/core';
import { CONFIG_TOKEN, IConfig } from "@kalila-edition/common-ui";
import { Router } from '@angular/router';
@Component({
    selector: 'kd-main-page',
    template: `
    <kd-layout  [dataManuscriptEndPoint]="manuscriptEndPoint">
      <span title>Kalīla wa-Dimna Edition <span class="version-number">(v.{{version}})</span></span>
      <main pageContent>
      <div class="box1">
        <img class="kwd"  src="{{ manuscriptEndPoint + 'about/KWD.jpg' }}" alt="Box 2 Image">
        <div class="content1">
          <img class="logo-img"  src="{{ manuscriptEndPoint + 'about/KD-Edition-Logo.png' }}" alt="Box 2 Image">
         <p>
         <span class="box-title"> THE EDITION...</span><br><br>
          Kalīla and Dimna is a Book of Wisdom...<br>
            or “Mirror of Princes” in fable form, it is one of the key texts of world literature. The versions incorporate a multitude of different stories or episodes in varying combinations...</p>

          <button (click)="navigateTo('/about')">About the project</button>
        </div>

      </div>


           <!--<div class="box" style="border: 0px">
             <div class="content">
             </div>
             <img style="width: 200%" src="{{ manuscriptEndPoint + 'about/headerbild.png' }}" alt="Box 2 Image">
           </div>
          Box 1 --><div  class="container-boxes">
        <!-- Box 1 -->
        <div class="box">
          <img src="{{ manuscriptEndPoint + 'about/manuscript.png' }}" alt="Box 1 Image">
          <div class="content">
            <p class="box-title">MANUSCRIPTS</p>
            <p>
              We originally started out with a small text sample of the chapter of "Mouse and Cat" in seven different manuscript versions.
              Meanwhile, this has expanded to further chapters and additional features.
              The Edition provides information on both the original manuscripts via their facsimile digital copies as well as facilitating reading by transcriptions in Arabic font.
            </p>
            <button (click)="navigateTo('/manuscripts')">View</button>
          </div>

        </div>
        <div class="box">
          <img src="{{ manuscriptEndPoint + 'about/collation.png' }}" alt="Box 2 Image">
          <div class="content">
            <p class="box-title">COLLATIONS</p>
            <p>
              We originally started out with a small text sample of the chapter of "Mouse and Cat" in seven different manuscript versions.
              <br>Meanwhile, this has expanded to further chapters and additional features.
              <br>The Edition provides information on both the original manuscripts via their facsimile digital copies as well as facilitating reading by transcriptions in Arabic font.  </p>
            <button (click)="navigateTo('/collations')">View</button>
          </div>

        </div>
        <div class="box">
          <img src="{{ manuscriptEndPoint + 'about/manuscript_description.png' }}" alt="Box 4 Image">
          <div class="content">
            <p class="box-title"> MANUSCRIPTS DESCRIPTION</p>
            <p>We originally started out with a small text sample of the chapter of "Mouse and Cat" in seven different manuscript versions.
              Meanwhile, this has expanded to further chapters and additional features.
              The Edition provides information on both the original manuscripts via their facsimile digital copies as well as facilitating reading by transcriptions in Arabic font. </p>
            <button (click)="navigateTo('/description')">View</button>
          </div>

        </div>
        <div class="box" >
          <img src="{{ manuscriptEndPoint + 'about/translation.png' }}" alt="Box 3 Image">
          <div class="content">
            <p class="box-title">ENGLISH TRANSLATION</p>
            <p>We originally started out with a small text sample of the chapter of "Mouse and Cat" in seven different manuscript versions.
              Meanwhile, this has expanded to further chapters and additional features.
              The Edition provides information on both the original manuscripts via their facsimile digital copies as well as facilitating reading by transcriptions in Arabic font. </p>
            <button (click)="navigateTo('/manuscripts/CCCP578/McEnglish/228')">View</button>
          </div>

        </div>

        <!-- Box 2 -->


        <!-- Box 3 -->


        <!-- Box 4 -->


        <!-- Box 5 -->
      <!--  <div class="box" style="width: 45%;">
          <img src="{{ manuscriptEndPoint + 'about/map.png' }}" alt="Box 5 Image">
          <div class="content">
            <p>Dissemination history</p>
            <p>Text</p>
            <button (click)="navigateTo('/guides/dissemination-history')">View</button>
          </div>

        </div>-->

        <!-- Box 6 -->
        <div class="box" >
          <img src="{{ manuscriptEndPoint + 'about/gallery.png' }}" alt="Box 6 Image">
          <div class="content">
            <p class="box-title"> GALLERY</p>
            <p>We originally started out with a small text sample of the chapter of "Mouse and Cat" in seven different manuscript versions.
              Meanwhile, this has expanded to further chapters and additional features.
              The Edition provides information on both the original manuscripts via their facsimile digital copies as well as facilitating reading by transcriptions in Arabic font. </p>
            <button (click)="navigateTo('/manuscripts/P400/gallery')">View</button>
          </div>

        </div>

        <!-- Box 7 -->
        <div class="box" >
          <img src="{{ manuscriptEndPoint + 'about/illustration.png' }}" alt="Box 7 Image">
          <div class="content">
            <p class="box-title">ILLUSTRATIONS</p>
            <p>We originally started out with a small text sample of the chapter of "Mouse and Cat" in seven different manuscript versions.
              Meanwhile, this has expanded to further chapters and additional features.
              The Edition provides information on both the original manuscripts via their facsimile digital copies as well as facilitating reading by transcriptions in Arabic font. </p>
            <button (click)="navigateTo('/manuscripts/illustrations')">View</button>
          </div>

        </div>
      </div>

      </main>
    </kd-layout>
  `,
    styleUrls: ['./main-page.component.scss'],
    standalone: false
})
export class MainPageComponent {

  manuscriptEndPoint = this.config.imagesEndPoint + 'manuscripts/';
  version = this.config.version;

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
