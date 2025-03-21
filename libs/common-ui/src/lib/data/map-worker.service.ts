import { Injectable } from '@angular/core';

export interface IColors {
  label: string;
  grid: string;
  boxColor: string;
  dividerColor: string;
  altBoxColor: string;
  boxBorderColor: string;
  rowHighlighterFill: string;
  boxHighlighterBorder: string;
  highlighterText: string;
  boxWithSearchResult: string;
}

export interface MapLabel {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
}

export interface MapLine {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export interface MapNumberText {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
}

export interface MapNumberLine {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export interface MapBox {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  stroke?: string;
  strokeWidth?: number;

}

export interface MapData {
  labels: MapLabel[];
  lines: MapLine[];
  numberTexts: MapNumberText[];
  numberLines: MapNumberLine[];
  boxes: MapBox[];
  heightOffset: number;
  widthOffset: number;
  labelFontSize: number;
  lineSpacing: number;
  distance: number;
  boxHeight: number;
  boxWidth: number;
  border: number;
}

@Injectable({
  providedIn: 'root',
})
export class MapWorkerService {
  private _map: Worker | undefined;

  init(mapWorker: Worker): void {
    this._map = mapWorker;

    this._map.onmessage = () => {
      console.log("no handler assigned");
    };
  }

  postMessage(data: number[][], colors: IColors, containerWidth: number, containerHeight: number): void {
    this._map?.postMessage({ mapData: data, colors, containerWidth, containerHeight });
  }

  handle(handler: (data: MapData) => void): void {
    if (!this._map) {
      return;
    }
    this._map.onmessage = ({ data }) => {
      handler(data);
    };
  }

  terminate(): void {
    this._map?.terminate();
  }
}
