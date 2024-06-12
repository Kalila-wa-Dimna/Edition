import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  OnDestroy,
  Output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FacsimileWorkerService, ICollationFacsimileHighlight } from '@kalila-edition/common-ui';
import { BehaviorSubject, Subscription, combineLatest, debounceTime, mergeMap, of } from 'rxjs';
import createImageObjects from './create-image-objects';
import { FacsimilePanelService } from '../../../services/facsimile-panel.service';

interface IImageRenderingInfo {
  imageObj: HTMLImageElement;
  key: string;
  width: number;
  height: number;
  x: number;
  y: number;
  info: ICollationFacsimileHighlight;
}

type LineObject = { key: string; imageObj: HTMLImageElement; info: ICollationFacsimileHighlight }
const GRID_SIZE = 15;


@Component({
  selector: 'kd-facsimile-panel',
  template: '<div #container id="container"></div>',
  styleUrls: ['./facsimile-panel.component.scss'],
})
export class FacsimilePanelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container')
  container!: ElementRef;
  sub: Subscription | undefined;
  rerenderStream = new BehaviorSubject<undefined>(undefined);

  @Output() goToRow = new EventEmitter<number>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private facsimileWorkerService: FacsimileWorkerService,
    private facsimilePanleService: FacsimilePanelService
  ) { }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.sub = combineLatest([this.facsimilePanleService.currentCellLine, this.rerenderStream])
        .pipe(mergeMap(([currentCellLine]) => combineLatest([this.facsimileWorkerService.currentLines, of(currentCellLine)])), debounceTime(100), mergeMap(([lines, currentCellLine]) => lines.size !== 0 ? combineLatest([createImageObjects(lines), of(currentCellLine)]) : of([[], currentCellLine])))
        .subscribe(async (data) => {
          this.facsimilePanleService.stageDataUrl.set(undefined);
          const [lines, currentCellLine] = data as [LineObject[], number];
          if (lines.length === 0) {
            await this.buildEmptyPanel();
          } else {
            await this.buildPanelWithImages(lines, currentCellLine);
          }
        });
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.rerenderStream.next(undefined);
  }



  async buildEmptyPanel() {
    const Konva = (await import('konva')).default;
    const containerWidth = this.container.nativeElement.offsetWidth;
    const containerHeight = this.container.nativeElement.offsetHeight;
    const gridLayer = new Konva.Layer({ listening: false });


    const stage = new Konva.Stage({
      container: this.container.nativeElement,
      width: containerWidth,
      height: containerHeight,
    });
    for (let i = 0; i < stage.width(); i += GRID_SIZE) {
      gridLayer.add(new Konva.Line({
        points: [Math.round(i) + 0.5, 0, Math.round(i) + 0.5, stage.height()],
        stroke: '#ddd',
        strokeWidth: 1,
      }));
    }
    for (let j = 0; j < stage.height(); j += GRID_SIZE) {
      gridLayer.add(new Konva.Line({
        points: [0, Math.round(j) + 0.5, stage.width(), Math.round(j) + 0.5],
        stroke: '#ddd',
        strokeWidth: 1,
      }));
    }
    stage.add(gridLayer);
  }

  async buildPanelWithImages(lines: LineObject[], currentCellLine: number) {
    const Konva = (await import('konva')).default;
    const containerWidth = this.container.nativeElement.offsetWidth;
    const containerHeight = this.container.nativeElement.offsetHeight;
    const sortedLines = lines.sort((a, b) => a.info.line - b.info.line).sort((a, b) => a.info.page - b.info.page);
    const visible = sortedLines[currentCellLine]

    const { images, width: adjustedWidth } = this.buildRenderingInfo([visible], containerWidth, containerHeight);

    const stage = new Konva.Stage({
      container: this.container.nativeElement,
      width: adjustedWidth,
      height: containerHeight,
    });

    stage.on('mouseup', () => {
      this.facsimilePanleService.stageDataUrl.set(stage.toDataURL());
    })

    stage.on('touchend', () => {
      this.facsimilePanleService.stageDataUrl.set(stage.toDataURL());
    })

    const layer = new Konva.Layer();
    stage.add(layer);

    const gridLayer = new Konva.Layer({ listening: false });
    for (let i = 0; i < stage.width(); i += GRID_SIZE) {
      gridLayer.add(new Konva.Line({
        points: [Math.round(i) + 0.5, 0, Math.round(i) + 0.5, stage.height()],
        stroke: '#ddd',
        strokeWidth: 1,
      }));
    }
    for (let j = 0; j < stage.height(); j += GRID_SIZE) {
      gridLayer.add(new Konva.Line({
        points: [0, Math.round(j) + 0.5, stage.width(), Math.round(j) + 0.5],
        stroke: '#ddd',
        strokeWidth: 1,
      }));
    }
    stage.add(gridLayer);


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups: Array<any> = [];
    for (const imageInfo of images) {

      const { width, height, imageObj, info, x, y } = imageInfo;

      const image = new Konva.Image({
        image: imageObj,
        width,
        height,
      });

      const text = new Konva.Text({
        text: `${info.unitDisplay} - ${info.siglum} (p.${info.page}, l.${info.line + 1})`,
        fontSize: height * 0.1,
        fontFamily: 'Calibri',
        fill: 'white',
        fontStyle: 'bold',
        align: 'center',
        width: width,
        padding: 1,
        x: 0,
        y: 0,
      });

      const group = new Konva.Group({
        x,
        y,
        draggable: true,
      });

      group.add(image);
      group.add(text);


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

      groups.push(group);

      // Update transformer when circle is clicked
      group.on('click', () => {

        transformer.nodes([group]);
        layer.draw();
      });

      group.on('dblclick', () => {
        this.goToRow.emit(info.unit);
      })

      const getDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
      }

      let lastDist = 0;
      group.on('touchmove', function (evt) {
        const touch1 = evt.evt.touches[0];
        const touch2 = evt.evt.touches[1];

        if (touch1 && touch2) {
          const dist = getDistance({
            x: touch1.clientX,
            y: touch1.clientY
          }, {
            x: touch2.clientX,
            y: touch2.clientY
          });

          if (!lastDist) {
            lastDist = dist;
          }

          const scale = group.scaleX() * dist / lastDist;

          group.scaleX(scale);
          group.scaleY(scale);
          layer.draw();

          lastDist = dist;
        }
      });

      group.on('touchend', function () {
        lastDist = 0;
      });

    }

    groups.forEach((group, index) => {
      group.on('mouseenter', () => {
        group.setZIndex(groups.length - 1);
        groups.forEach((otherGroup, otherIndex) => {
          if (otherIndex !== index) {
            otherGroup.setZIndex(0);
          }
        })
      })
    })

    gridLayer.setZIndex(0);
    this.facsimilePanleService.stageDataUrl.set(stage.toDataURL());
  }


  buildRenderingInfo(lines: { key: string; imageObj: HTMLImageElement; info: ICollationFacsimileHighlight }[], minWidth: number, height: number): { images: IImageRenderingInfo[], width: number } {
    const images: IImageRenderingInfo[] = [];
    let totalWidth = 0;
    let x = 0;
    let y = 0;

    if (lines.length === 1) {


      const imageObj = lines[0].imageObj;
      const aspectRatio = imageObj.width / imageObj.height;

      let imgWidth = minWidth;
      let imgHeight = height;

      if (imgWidth / aspectRatio <= height) {
        imgHeight = imgWidth / aspectRatio;
      } else {
        imgWidth = imgHeight * aspectRatio;
      }


      images.push({
        key: lines[0].key,
        imageObj: lines[0].imageObj,
        width: imgWidth,
        height: imgHeight,
        x: x,
        y: y,
        info: lines[0].info
      });

      return { images, width: minWidth };
    }

    for (const { imageObj, key, info } of lines) {
      let width = imageObj.width;
      let imgHeight = imageObj.height;

      // Resize if width is larger than 300
      if (width > 300) {
        const aspectRatio = width / imgHeight;
        width = 300;
        imgHeight = width / aspectRatio;
      }

      // Check if the image is going to intersect with the bottom border
      if (y + imgHeight + 5 > height) {
        y = 0;
        x += 305; // Increment x by 300 (width of image) + 5 (distance between images)
      }

      // Add image to the array
      images.push({
        key,
        imageObj,
        width: width,
        height: imgHeight,
        x: x,
        y: y,
        info
      });

      // Calculate total width, including 5px distance between images
      totalWidth = x + width + 5;
      y += imgHeight + 5; // Increment y by height of image + 5 (distance between images)
    }

    // Return the minWidth if no width extension is needed
    const canvasWidth = totalWidth > minWidth ? totalWidth : minWidth;

    return { images, width: canvasWidth };

  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
