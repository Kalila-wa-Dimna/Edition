import { Component, HostListener } from '@angular/core';
import { ViewportScroller } from "@angular/common";



@Component({
    selector: 'kd-edition-transcription-guidelines',
    templateUrl: './transcription-guidelines.component.html',
    styleUrl: './transcription-guidelines.component.scss',
    standalone: false
})
export class TranscriptionGuidelinesComponent {
  page = 'transcription-guidelines';
  pageTitle = 'Transcription Guidelines';
  activeAnchor: string | null = null;


  constructor(private scroller: ViewportScroller) { }

  @HostListener('window:scroll', ['$event'])
  handleScroll() {
    this.activeAnchor = this.findNearestHeading();
  }

  onScroll(anchor: string) {
    this.scroller.scrollToAnchor(anchor);
  }


  // Function to find the nearest heading element (h1, h2, h3, h4) to the current scroll position
  findNearestHeading() {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
    const viewportTop = 0;
    const viewportBottom = window.innerHeight;

    if (headings.length === 0) {
      return null;
    }

    let nearestHeading: Element | null = null;
    let minDistance = Infinity;

    headings.forEach(heading => {
      const headingRect = heading.getBoundingClientRect();
      const distance = Math.abs(viewportTop - headingRect.top);

      // Check if the heading is within the viewport
      if (distance < minDistance) {
        nearestHeading = heading;
        minDistance = distance;
      }
    });

    return nearestHeading ? (nearestHeading as Element).getAttribute('id') : null;
  }


}
