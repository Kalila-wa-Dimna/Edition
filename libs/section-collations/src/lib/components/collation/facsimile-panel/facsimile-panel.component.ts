import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FacsimileWorkerService } from '@kalila-edition/common-ui';
import { Subscription, debounceTime } from 'rxjs';

@Component({
  selector: 'kd-facsimile-panel',
  template: '<div #container id="container"></div>',
  styleUrls: ['./facsimile-panel.component.scss'],
})
export class FacsimilePanelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container')
  container!: ElementRef;
  sub: Subscription | undefined;
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private facsimileWorkerService: FacsimileWorkerService
  ) { }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.sub = this.facsimileWorkerService.currentLines
        .pipe(debounceTime(100))
        .subscribe(async (lines) => {
          await this.buildPanel(lines);
        });
    }
  }

  async buildPanel(lines: Map<string, string>) {
    const Konva = (await import('konva')).default;
    const containerWidth = this.container.nativeElement.offsetWidth;
    const containerHeight = this.container.nativeElement.offsetHeight;

    const stage = new Konva.Stage({
      container: this.container.nativeElement,
      width: containerWidth,
      height: containerHeight,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    let x = 0;
    let y = 0;
    for (const [key, imageDataUrl] of lines) {
      const imageObj = new Image();
      imageObj.onload = () => {
        const { width, height } = this.calculateDimensions(
          imageObj,
          containerWidth
        );
        if (y + height + containerHeight * 0.02 > containerHeight) {
          y = 0;
          x += width + containerWidth * 0.02;
        }
        const image = new Konva.Image({
          image: imageObj,
          width,
          height,
        });

        const text = new Konva.Text({
          text: key,
          fontSize: 12,
          fontFamily: 'Calibri',
          fill: 'white',
          fontStyle: 'bold',
          align: 'center',
          width: width,
          padding: 5,
          x: 0,
          y: 0,
        });

        const group = new Konva.Group({
          x: x,
          y: y,
          draggable: true,
        });

        group.add(image);
        group.add(text);

        if (y + height + containerHeight * 0.02 < containerHeight) {
          y += height + containerHeight * 0.02;
        } else {
          y = 0;
          x += width + containerWidth * 0.02;
        }

        const transformer = new Konva.Transformer({
          nodes: [group],
          keepRatio: true,
          enabledAnchors: [
            'bottom-right',
            'top-left',
            'top-right',
            'bottom-left',
          ],
          rotateEnabled: false,
        });

        layer.add(group);
        layer.add(transformer);

        // Update transformer when circle is clicked
        group.on('click', () => {

          transformer.nodes([group]);
          layer.draw();
        });

        group.on('mouseenter', () => {
          group.setZIndex(100);
        })

        group.on('mouseleave', () => {
          group.setZIndex(0);
        })
      };
      imageObj.src = imageDataUrl;
    }
  }

  calculateDimensions(
    imageObj: HTMLImageElement,
    containerWidth: number
  ): { width: number; height: number } {
    const width = containerWidth * 0.3;
    const height = imageObj.height * (width / imageObj.width);
    return { width, height };
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
