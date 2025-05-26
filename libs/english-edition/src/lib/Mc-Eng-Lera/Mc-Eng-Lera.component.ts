import { Component, Renderer2, ElementRef, AfterViewInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from "@angular/router";
import { LayoutModule } from "@kalila-edition/common-ui";
declare function leraCatView(): void;

@Component({
  selector: 'lib-mc-eng-lera',
  imports: [CommonModule, LayoutModule],
  templateUrl: './Mc-Eng-Lera.component.html',
  styleUrl: './Mc-Eng-Lera.component.css',
})
export class McEngLeraComponent implements AfterViewInit {
  @ViewChild('CATview') catViewElement!: ElementRef;
  flag = true;
  value = "Overview";
  public pdfSrc = '../assets/pdf/ToC_Arabic_PDF.pdf';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: unknown,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId as Object)) {
      if (this.catViewElement?.nativeElement) {
        const catViewElement = this.catViewElement.nativeElement;
        catViewElement.style.display = 'none';
      } else {
        console.error('CATview element is not defined');
      }

      const el = document.getElementsByClassName('wasserzeichen') as HTMLCollectionOf<HTMLElement>;
      for (let i = 0; i < el.length; i++) {
        el[i].style.display = 'none';
      }

      const listOfUnit = Array.prototype.slice
        .call(document.querySelectorAll('span.main-font'))
        .map((a) => a.innerHTML);

      const content = Array.prototype.slice
        .call(document.querySelectorAll('span.btn-ml-menu-non'))
        .map((a) => a.innerHTML);

      for (let i = 0; i < listOfUnit.length; i++) {
        const list = document.getElementsByClassName('synopsis-ml-menu')[i];
        list.getElementsByClassName('btn-ml-menu-non')[0].innerHTML = `${i + 1}/${listOfUnit[i]}`;
        list.getElementsByClassName('btn-ml-menu-non')[0].classList.add('btn-ml-menu');
      }
    }
  }

  closeScreen() {
    if (isPlatformBrowser(this.platformId as Object)) {
      const catViewElement = this.catViewElement.nativeElement;
      const closeElement = document.getElementById('close');

      if (catViewElement && closeElement) {
        catViewElement.style.display = 'none';
        closeElement.style.display = 'none';
        this.flag = true;
        this.value = "Overview";
      }
    }
  }

  showCatView() {
    if (isPlatformBrowser(this.platformId as Object)) {
      const catViewElement = this.catViewElement.nativeElement;
      const closeElement = document.getElementById('close');

      if (catViewElement && closeElement) {
        if (this.flag) {
          catViewElement.style.display = 'block';
          closeElement.style.display = 'block';
          leraCatView();
          console.log('hello');
          this.flag = false;
          this.value = "Close the overview";
        } else {
          catViewElement.style.display = 'none';
          closeElement.style.display = 'none';
          this.flag = true;
          this.value = "Overview";
        }
      } else {
        console.error("Element with ID 'close' not found");
      }
    }
  }

  toggleClass(element: HTMLElement, class1: string, class2: string, matchExact: boolean) {
    if (matchExact) {
      if (element && element.className === class1) {
        element.className = element.className.replace(class1, class2);
      } else if (element && element.className === class2) {
        element.className = element.className.replace(class2, class1);
      }
    } else {
      if (element && element.className.indexOf(class1) !== -1) {
        element.className = element.className.replace(new RegExp(class1), class2);
      } else if (element && element.className.indexOf(class2) !== -1) {
        element.className = element.className.replace(new RegExp(class2), class1);
      }
    }
  }
}
